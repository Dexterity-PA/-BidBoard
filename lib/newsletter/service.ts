import * as repository from "./repository";
import { sendNewsletterConfirmation } from "./mail";
import { confirmationToken, cooldownKey, hashConfirmationToken, newsletterAppUrl, normalizeNewsletterEmail, subscriberIdFromUnsubscribeToken, unsubscribeToken, validConfirmationToken } from "./tokens";

export class NewsletterInputError extends Error {}
export class NewsletterRateLimitError extends Error {
  readonly retryAfterSeconds = 60;
  constructor() {
    super("Too many subscription requests from this network. Please try again in one minute.");
  }
}

export const SUBSCRIBE_MESSAGE = "If this address can receive a confirmation, check your inbox to finish subscribing.";

export async function requestNewsletterSubscription(input: { email: unknown; consent: unknown; ip: string }, now = new Date()) {
  const email = normalizeNewsletterEmail(input.email);
  if (!email || input.consent !== true) throw new NewsletterInputError("Enter a valid email and opt in to the weekly digest.");
  const appUrl = newsletterAppUrl();
  const claimed: { key: string; until: Date }[] = [];
  try {
    // Ten independent durable slots allow a shared school network to subscribe
    // several students while still bounding requests to ten per rolling minute.
    for (let slot = 0; slot < 10; slot++) {
      const cooldown = {
        key: cooldownKey("ip", `${input.ip}\0${slot}`),
        until: new Date(now.getTime() + 60_000),
      };
      if (await repository.claimCooldown(cooldown.key, cooldown.until, now)) {
        claimed.push(cooldown);
        break;
      }
    }
    if (!claimed.length) throw new NewsletterRateLimitError();

    const emailCooldown = { key: cooldownKey("email", email), until: new Date(now.getTime() + 15 * 60_000) };
    if (!await repository.claimCooldown(emailCooldown.key, emailCooldown.until, now)) return;
    claimed.push(emailCooldown);
    const token = confirmationToken();
    const tokenHash = hashConfirmationToken(token);
    const subscriber = await repository.reservePendingSubscription(email, tokenHash, new Date(now.getTime() + 24 * 60 * 60_000), now);
    // Existing confirmed subscriptions are unchanged; the response is identical.
    if (!subscriber) return;
    const optOutToken = unsubscribeToken(subscriber.id);
    await sendNewsletterConfirmation({
      email,
      appUrl,
      confirmationUrl: `${appUrl}/newsletter/confirm?token=${token}`,
      unsubscribeUrl: `${appUrl}/newsletter/unsubscribe?token=${optOutToken}`,
      idempotencyKey: `newsletter-confirm/${tokenHash}`,
    });
  } catch (error) {
    // A failed send is not reported as successful. Allow a real retry instead
    // of leaving the email behind a cooldown after its provider request failed.
    await Promise.allSettled(claimed.map((cooldown) => repository.releaseCooldown(cooldown.key, cooldown.until)));
    throw error;
  }
}

export async function confirmNewsletter(token: unknown, now = new Date()) {
  if (!validConfirmationToken(token)) return false;
  return repository.confirmSubscription(hashConfirmationToken(token), now);
}

export async function unsubscribeNewsletter(token: unknown, now = new Date()) {
  const id = subscriberIdFromUnsubscribeToken(token);
  return id ? repository.unsubscribe(id, now) : false;
}
