import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — BidBoard",
  description:
    "BidBoard pricing. Free to start — no credit card required. Upgrade for unlimited scholarship matches and AI essay tools.",
  openGraph: {
    title: "Pricing — BidBoard",
    description:
      "BidBoard pricing. Free to start — no credit card required. Upgrade for unlimited scholarship matches and AI essay tools.",
    url: "https://bidboard.app/pricing",
    siteName: "BidBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — BidBoard",
    description:
      "BidBoard pricing. Free to start — no credit card required. Upgrade for unlimited scholarship matches and AI essay tools.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
