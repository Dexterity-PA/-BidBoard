export function WidgetsSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* Progress ring skeleton */}
      <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-200" />
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="h-40 w-40 animate-pulse rounded-full bg-gray-200" />
          <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* Next action skeleton */}
      <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-200" />
        <div className="flex flex-col justify-between gap-4 py-2">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
