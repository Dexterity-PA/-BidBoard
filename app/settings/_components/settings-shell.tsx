"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Star, Bell, CreditCard, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileSection } from "./profile-section";
import { PreferencesSection } from "./preferences-section";
import { NotificationsSection } from "./notifications-section";
import { BillingSection } from "./billing-section";
import { AccountSection } from "./account-section";
import type { SettingsData } from "../types";

const TABS = [
  { id: "profile",       label: "Profile",                 Icon: User       },
  { id: "preferences",   label: "Scholarship Preferences", Icon: Star       },
  { id: "notifications", label: "Notifications",           Icon: Bell       },
  { id: "billing",       label: "Billing",                 Icon: CreditCard },
  { id: "account",       label: "Account",                 Icon: Shield     },
] as const;

type TabId = typeof TABS[number]["id"];
type Toast = { type: "success" | "error"; msg: string } | null;

export function SettingsShell({ data }: { data: SettingsData }) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [unsaved, setUnsavedMap] = useState<Partial<Record<TabId, boolean>>>({});
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const markUnsaved = useCallback((tab: TabId, dirty: boolean) => {
    setUnsavedMap((prev) => ({ ...prev, [tab]: dirty }));
  }, []);

  const showToast = useCallback((type: "success" | "error", msg: string) => {
    setToast({ type, msg });
  }, []);

  const clearUnsaved = useCallback((tab: TabId) => {
    setUnsavedMap((prev) => ({ ...prev, [tab]: false }));
  }, []);

  const activeSection = (() => {
    const props = { data, showToast, onSaved: () => clearUnsaved(activeTab) };
    switch (activeTab) {
      case "profile":
        return <ProfileSection {...props} onDirty={(d) => markUnsaved("profile", d)} />;
      case "preferences":
        return <PreferencesSection {...props} onDirty={(d) => markUnsaved("preferences", d)} />;
      case "notifications":
        return <NotificationsSection {...props} onDirty={(d) => markUnsaved("notifications", d)} />;
      case "billing":
        return <BillingSection {...props} />;
      case "account":
        return <AccountSection {...props} />;
    }
  })();

  return (
    <div className="relative min-h-full p-6 lg:p-8">
      {/* Mobile tab dropdown */}
      <div className="mb-5 lg:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as TabId)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {TABS.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}{unsaved[id] ? " •" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left: tab nav (desktop only) */}
        <nav className="hidden lg:flex w-52 shrink-0 flex-col gap-0.5">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left",
                activeTab === id
                  ? "bg-indigo-50 font-semibold text-indigo-700"
                  : "font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  activeTab === id ? "text-indigo-600" : "text-gray-400"
                )}
              />
              <span className="flex-1 truncate">{label}</span>
              {unsaved[id] && (
                <span className="text-[10px] font-bold text-amber-500">•</span>
              )}
            </button>
          ))}
        </nav>

        {/* Right: section card */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6 lg:p-8">
            {activeSection}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ring-1",
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
              : "bg-red-50 text-red-800 ring-red-200"
          )}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
