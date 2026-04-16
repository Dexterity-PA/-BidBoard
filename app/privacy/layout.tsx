import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BidBoard",
  description:
    "BidBoard's Privacy Policy. Learn what data we collect, how we use it, and how we protect it.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
