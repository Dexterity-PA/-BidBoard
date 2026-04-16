export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BidBoard — Scholarship strategy, engineered.",
  description:
    "BidBoard scores every scholarship by expected value — award × win probability ÷ hours. Stop guessing. Start winning.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "BidBoard — Scholarship strategy, engineered.",
    description:
      "BidBoard scores every scholarship by expected value — award × win probability ÷ hours. Stop guessing. Start winning.",
    url: "https://bidboard.app",
    siteName: "BidBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BidBoard — Scholarship strategy, engineered.",
    description:
      "BidBoard scores every scholarship by expected value — award × win probability ÷ hours. Stop guessing. Start winning.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${instrumentSerif.variable} ${dmSans.variable}`}
      >
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
