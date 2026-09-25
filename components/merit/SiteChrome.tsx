import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function SiteHeader() {
  return (
    <header className="m-header">
      <div className="m-wrap m-header-row">
        <Link href="/" className="m-brand" aria-label="BidBoard home">
          <span className="m-brand-mark" aria-hidden>
            B
          </span>
          BidBoard
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
              <span className="m-hide-sm-text">Create free account</span>
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
        <span>BidBoard is free. Always check the official source before you apply.</span>
        <nav className="m-footer-links" aria-label="Footer">
          <Link href="/scholarships">Browse</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/security">Security</Link>
          <a href="mailto:hello@bidboard.app">hello@bidboard.app</a>
        </nav>
      </div>
    </footer>
  );
}
