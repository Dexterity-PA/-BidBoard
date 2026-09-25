"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/merit/SiteChrome";

const TABS = [
  { href: "/tracker", label: "Tracker" },
  { href: "/deadlines", label: "Deadlines" },
  { href: "/scholarships", label: "Browse" },
  { href: "/settings", label: "Settings" },
] as const;

export interface AppShellProps {
  children: React.ReactNode;
  // Kept for existing layouts; the header's account menu shows the user.
  userName?: string;
  userEmail?: string;
  userImageUrl?: string;
}

/** Signed-in frame: the public site header plus app tabs, in the Meritously style. */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  return (
    <div className="m-page">
      <SiteHeader />
      <nav className="m-tabs" aria-label="Your account">
        <div className="m-wrap m-tabs-row">
          {TABS.map((t) => {
            const active = pathname === t.href || pathname.startsWith(t.href + "/");
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`m-tab${active ? " m-tab-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <main className="m-main">
        <div className="m-wrap m-app">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
