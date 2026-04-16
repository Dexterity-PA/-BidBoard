import Link from "next/link";

export default function ScholarshipNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-5xl font-bold text-gray-200">404</p>
        <h1 className="text-xl font-semibold text-gray-900">Scholarship not found</h1>
        <p className="text-sm text-gray-500">
          We couldn&apos;t find that scholarship. It may have been removed or the URL
          may be incorrect.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/scholarships"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Browse scholarships
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
