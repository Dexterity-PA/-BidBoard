export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "./merit.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const title = "BidBoard: free merit scholarship finder";
const description =
  "A free, merit-only catalog for high-achieving students: college full rides, national awards and niche scholarships, each linked to its official source.";

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: "/icon.svg" },
  openGraph: {
    title,
    description,
    url: "https://bidboard.app",
    siteName: "BidBoard",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
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
        className={`${instrumentSerif.variable} ${dmSans.variable} ${plexMono.variable}`}
      >
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
