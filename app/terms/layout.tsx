import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms of Service | Meritously",
  description:
    "Meritously's Terms of Service. Read the terms governing use of our merit scholarship finder.",
  openGraph: {
    title: "Terms of Service | Meritously",
    description:
      "Meritously's Terms of Service. Read the terms governing use of our merit scholarship finder.",
    url: "https://meritously.com/terms",
    siteName: "Meritously",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Meritously",
    description:
      "Meritously's Terms of Service. Read the terms governing use of our merit scholarship finder.",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
