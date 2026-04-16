import { ClipboardList } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <ClipboardList className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No scholarships tracked yet
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        Save scholarships to track your application progress — from discovery all
        the way to outcome.
      </p>
      <Link
        href="/matches"
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Browse Scholarships
      </Link>
    </div>
  );
}
