import { LISTINGS, type MeritListing } from "@/lib/merit/catalog";
import * as repository from "./repository";
import { buildNewsletterBatchPayload, sendNewsletterBatch } from "./mail";
import { newsletterAppUrl } from "./tokens";
import type { NewsletterDigestContent } from "./types";

export function digestWeek(now: Date) {
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  return monday.toISOString().slice(0, 10);
}

export function buildDigestContent(now: Date, listings: MeritListing[] = LISTINGS): NewsletterDigestContent {
  const appUrl = newsletterAppUrl();
  const today = now.toISOString().slice(0, 10);
  const lastDay = new Date(now.getTime() + 30 * 86_400_000).toISOString().slice(0, 10);
  return {
    week: digestWeek(now), appUrl,
    awards: listings.filter((listing) => listing.status === "live" && listing.deadlineDate && listing.deadlineDate >= today && listing.deadlineDate <= lastDay && /^https:\/\//i.test(listing.sources[0] ?? ""))
      .sort((a, b) => a.deadlineDate!.localeCompare(b.deadlineDate!) || a.id.localeCompare(b.id))
      .slice(0, 6).map((listing) => ({
        id: listing.id, name: listing.name, provider: listing.provider, value: listing.value,
        deadline: listing.deadlineDate!, sourceUrl: listing.sources[0], listingUrl: `${appUrl}/scholarships/${listing.slug}`,
      })),
  };
}

export async function runNewsletterDigest(now = new Date(), options: { pause?: () => Promise<void>; maxBatches?: number } = {}) {
  const content = buildDigestContent(now);
  const result = { sent: 0, failed: 0, skipped: 0, batches: 0, backlog: false };
  if (!content.awards.length) return result;
  // 100 recipients/request and 100 new batches/run supports 10,000 opted-in
  // recipients without a per-recipient API or database round trip.
  const limit = Math.max(1, Math.min(100, options.maxBatches ?? 100));
  const stopAt = Date.now() + 240_000;
  const pause = options.pause ?? (() => new Promise<void>((resolve) => setTimeout(resolve, 650)));
  const attempted: string[] = [];
  for (let i = 0; i < limit && Date.now() < stopAt; i++) {
    let batch = await repository.reserveDigestBatch(content, new Date());
    if (!batch) batch = await repository.claimRetryBatch(content.week, new Date(), attempted);
    if (!batch) break;
    attempted.push(batch.id);
    result.batches += 1;
    const recipientCount = batch.recipients.length;
    try {
      if (!batch.payload) {
        const payload = await buildNewsletterBatchPayload(batch.content, batch.recipients);
        const prepared = await repository.saveBatchPayload(batch, payload);
        if (!prepared) throw new Error("Newsletter batch lease changed during preparation");
        batch = prepared;
      }
      // Retry once immediately under the same immutable payload/key. This lets
      // daily cron recover transient failures without crossing the 24h window.
      let acknowledged = false;
      for (let attempt = 0; attempt < 2 && !acknowledged; attempt++) {
        const confirmed = await repository.confirmedBatchRecipients(batch.recipients.map((recipient) => recipient.id));
        const current = new Map(confirmed.map((recipient) => [recipient.id, recipient.email]));
        if (batch.recipients.some((recipient) => current.get(recipient.id) !== recipient.email)) {
          // A previously attempted batch cannot change its audience under the
          // same idempotency key. Withhold it entirely after any opt-out.
          await repository.finishBatch(batch, { status: "skipped", error: "Batch withheld because a recipient is no longer confirmed" }, new Date());
          result.skipped += recipientCount;
          acknowledged = true;
          break;
        }
        try {
          const providerIds = await sendNewsletterBatch(batch.id, batch.payload!);
          await repository.finishBatch(batch, { status: "sent", providerIds }, new Date());
          result.sent += recipientCount;
          acknowledged = true;
        } catch (error) {
          if (attempt === 1) throw error;
          await pause();
        }
      }
    } catch {
      await repository.finishBatch(batch, { status: "failed", error: "Batch was not durably acknowledged; retry only inside the provider idempotency window" }, new Date());
      result.failed += recipientCount;
    }
    await pause();
  }
  result.backlog = await repository.hasUnclaimedRecipients(content.week);
  return result;
}
