export type NewsletterAward = {
  id: string;
  name: string;
  provider: string;
  value: string;
  deadline: string;
  sourceUrl: string;
  listingUrl: string;
};

export type NewsletterDigestContent = {
  week: string;
  appUrl: string;
  awards: NewsletterAward[];
};

export type NewsletterRecipient = { id: string; email: string };
export type NewsletterMessage = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
};
