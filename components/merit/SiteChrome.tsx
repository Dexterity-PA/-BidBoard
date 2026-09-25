import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function LogoMark({ className = "m-brand-mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 22 22" aria-hidden>
      <circle cx="11" cy="11" r="11" fill="#0F5D3E" />
      <polygon
        points="11.00,5.60 12.35,9.14 16.14,9.33 13.19,11.71 14.17,15.37 11.00,13.30 7.83,15.37 8.81,11.71 5.86,9.33 9.65,9.14"
        fill="#fff"
      />
    </svg>
  );
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
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/security">Security</Link>
          <a href="mailto:hello@bidboard.app">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
