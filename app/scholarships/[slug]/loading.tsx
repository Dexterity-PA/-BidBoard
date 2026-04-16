export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav skeleton */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {/* Left column */}
          <div className="min-w-0 flex-1 space-y-6">
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>

          {/* Right sidebar */}
          <div className="w-full shrink-0 lg:w-80">
            <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between py-1">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
              <div className="h-9 w-full animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
