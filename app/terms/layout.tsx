import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — BidBoard",
  description:
    "BidBoard's Terms of Service. Read the terms governing use of our scholarship strategy platform.",
  openGraph: {
    title: "Terms of Service — BidBoard",
    description:
      "BidBoard's Terms of Service. Read the terms governing use of our scholarship strategy platform.",
    url: "https://bidboard.app/terms",
    siteName: "BidBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service — BidBoard",
    description:
      "BidBoard's Terms of Service. Read the terms governing use of our scholarship strategy platform.",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
