import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import MeritouslyMark from "@/components/merit/LogoMark";

export function LogoMark({ className = "m-brand-mark" }: { className?: string }) {
  return <MeritouslyMark className={className} />;
}

export function SiteHeader() {
  return (
    <header className="m-header">
      <div className="m-wrap m-header-row">
        <Link href="/" className="m-brand" aria-label="Meritously home">
          <LogoMark />
          Meritously
        </Link>
        <nav className="m-nav" aria-label="Main">
          <Link href="/scholarships" className="m-nav-link">
            Browse
          </Link>
          <SignedOut>
            <Link href="/sign-in" className="m-nav-link">
              Sign in
            </Link>
            <Link href="/sign-up" className="m-btn m-btn-primary m-btn-sm">
              <span className="m-hide-sm-text">Get started free</span>
              <span className="m-only-sm">Sign up</span>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/tracker" className="m-nav-link">
              My tracker
            </Link>
            <UserButton />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="m-footer">
      <div className="m-wrap m-footer-row">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <LogoMark className="m-brand-mark" />
          Meritously is free. Always confirm details on the official source.
        </span>
        <nav className="m-footer-links" aria-label="Footer">
          <Link href="/scholarships">Browse</Link>
          <Link href="/#about">About</Link>
          <Link href="/#updates">Email updates</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/security">Security</Link>
          <a href="mailto:hello@meritously.com">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
