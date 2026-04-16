import Link from "next/link";
import type { NextAction } from "@/lib/dashboard/queries";

interface Props {
  action: NextAction;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconFire({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconSparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Action config ─────────────────────────────────────────────────────────────

type ActionConfig = {
  icon: React.ReactNode;
  iconBg: string;
  iconText: string;
  eyebrow: string;
  cta: string;
};

function getConfig(type: NextAction["type"]): ActionConfig {
  switch (type) {
    case "urgent_in_progress":
      return {
        icon: <IconFire className="h-5 w-5" />,
        iconBg: "bg-red-100",
        iconText: "text-red-600",
        eyebrow: "Urgent · Due soon",
        cta: "Open Tracker",
      };
    case "start_saved":
      return {
        icon: <IconClock className="h-5 w-5" />,
        iconBg: "bg-amber-100",
        iconText: "text-amber-600",
        eyebrow: "Coming up · Deadline this week",
        cta: "Open Tracker",
      };
    case "high_ev_match":
      return {
        icon: <IconStar className="h-5 w-5" />,
        iconBg: "bg-emerald-100",
        iconText: "text-emerald-600",
        eyebrow: "Top match",
        cta: "View Scholarship",
      };
    case "new_user":
      return {
        icon: <IconSparkle className="h-5 w-5" />,
        iconBg: "bg-indigo-100",
        iconText: "text-indigo-600",
        eyebrow: "Get started",
        cta: "Find Scholarships",
      };
    case "browse":
    default:
      return {
        icon: <IconSearch className="h-5 w-5" />,
        iconBg: "bg-gray-100",
        iconText: "text-gray-500",
        eyebrow: "Explore",
        cta: "Browse Matches",
      };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NextActionCard({ action }: Props) {
  const cfg = getConfig(action.type);

  return (
    <div className="flex flex-col justify-between gap-4 p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg} ${cfg.iconText}`}
        >
          {cfg.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {cfg.eyebrow}
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug text-gray-900">
            {action.label}
          </p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={action.href}
        className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        {cfg.cta} →
      </Link>
    </div>
  );
}
