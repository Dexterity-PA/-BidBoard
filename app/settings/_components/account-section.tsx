"use client";

import { useState, useTransition } from "react";
import { ExternalLink } from "lucide-react";
import { exportUserData, deleteAccount } from "../actions";

interface Props {
  showToast: (type: "success" | "error", msg: string) => void;
}

export function AccountSection({ showToast }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [isExporting, startExport] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function handleExport() {
    startExport(async () => {
      try {
        const json = await exportUserData();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "bidboard-data.json";
        a.click();
        URL.revokeObjectURL(url);
        showToast("success", "Your data export has started downloading.");
      } catch {
        showToast("error", "Failed to export data.");
      }
    });
  }

  function handleDelete() {
    if (deleteInput !== "DELETE") return;
    startDelete(async () => {
      try {
        await deleteAccount();
        // deleteAccount redirects to "/" on success — this line won't be reached
      } catch {
        showToast("error", "Failed to delete account. Please try again.");
        setDeleteOpen(false);
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Account</h2>
        <p className="text-sm text-gray-500 mt-0.5">Security, data, and account management.</p>
      </div>

      {/* Change password */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Password</p>
        <a
          href="https://accounts.clerk.dev/user/security"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Change password via Clerk <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Connected accounts */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Connected accounts</p>
        <a
          href="https://accounts.clerk.dev/user/connected-accounts"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Manage social logins via Clerk <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Export data */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Export my data</p>
        <p className="text-sm text-gray-500">
          Download all your profile, applications, and essay data as JSON.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          {isExporting ? "Preparing…" : "Export data"}
        </button>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-3">
        <p className="text-sm font-semibold text-red-800">Danger zone</p>
        <p className="text-sm text-red-700">
          Permanently deletes your account and all associated data — profile, matches, essays,
          applications. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          Delete account
        </button>
      </div>

      {/* Delete confirmation modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Delete your account?</h3>
            <p className="text-sm text-gray-600">
              This will permanently delete:
              <br />· Your profile and preferences
              <br />· All scholarship matches
              <br />· All saved essays
              <br />· All application tracker data
            </p>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Type <span className="font-mono text-red-600">DELETE</span> to confirm:
              </p>
              <input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
                placeholder="DELETE"
                autoComplete="off"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteInput("");
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteInput !== "DELETE" || isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
              >
                {isDeleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
