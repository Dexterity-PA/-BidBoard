import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BidBoard",
  description:
    "BidBoard's Privacy Policy. Learn what data we collect, how we use it, and how we protect it.",
  openGraph: {
    title: "Privacy Policy — BidBoard",
    description:
      "BidBoard's Privacy Policy. Learn what data we collect, how we use it, and how we protect it.",
    url: "https://bidboard.app/privacy",
    siteName: "BidBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — BidBoard",
    description:
      "BidBoard's Privacy Policy. Learn what data we collect, how we use it, and how we protect it.",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
