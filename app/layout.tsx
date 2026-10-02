export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Analytics from "@/components/merit/Analytics";
import "./globals.css";
import "./merit.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

const title = "Meritously: free merit scholarship finder";
const description =
  "Find potential merit scholarship matches with four answers. Browse college awards and competitions with official sources, then save awards and track deadlines for free.";

export const metadata: Metadata = {
  metadataBase: new URL("https://meritously.com"),
  title,
  description,
  icons: { icon: "/icon.svg" },
  openGraph: {
    title,
    description,
    url: "https://meritously.com",
    siteName: "Meritously",
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
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      localization={{
        signIn: {
          start: {
            title: "Sign in to Meritously",
            titleCombined: "Sign in to Meritously",
            subtitle: "Return to your saved awards and deadlines.",
            subtitleCombined: "Return to your saved awards and deadlines.",
          },
          emailCode: { subtitle: "Continue to Meritously." },
          emailCodeMfa: { subtitle: "Continue to Meritously." },
          emailLink: { subtitle: "Continue to Meritously." },
          emailLinkMfa: { subtitle: "Continue to Meritously." },
          phoneCode: { subtitle: "Continue to Meritously." },
        },
        signUp: {
          start: {
            title: "Join Meritously",
            subtitle: "Create a free account to save awards and track deadlines.",
          },
          emailLink: { subtitle: "Continue to Meritously." },
        },
      }}
      appearance={{
        layout: { logoImageUrl: "/icon.svg", logoLinkUrl: "/" },
        variables: {
          colorPrimary: "#0f5d3e",
          colorText: "#0c0f0d",
          colorTextSecondary: "#5a615c",
          fontFamily: "var(--font-geist), ui-sans-serif, sans-serif",
          borderRadius: "0.625rem",
        },
        elements: {
          logoImage: { width: "40px", height: "40px" },
          cardBox: { boxShadow: "none", border: "1px solid #e6e8e6" },
          card: { boxShadow: "none", border: "none" },
          formButtonPrimary: {
            backgroundImage: "none", boxShadow: "none !important", minHeight: "44px",
            "&::after": { display: "none" },
          },
          footer: { background: "#f4f5f4", backgroundImage: "none" },
        },
      }}
    >
      <html
        lang="en"
        className={`${geist.variable} ${geistMono.variable}`}
      >
        <body>{children}{process.env.ANALYTICS_ENABLED === "true" && <Analytics />}</body>
      </html>
    </ClerkProvider>
  );
}
