/**
 * Suspense fallback while a page chunk loads: a hairline that sweeps across the
 * top of the viewport plus a quiet placeholder, instead of a spinner.
 */
const RouteProgress = () => (
  <div className="route-progress flex flex-1 flex-col" role="status" aria-live="polite" aria-label="Loading page">
    <span className="route-progress-bar" />
    <div className="mx-auto w-full max-w-3xl px-6 pt-20 text-center md:px-10">
      <span className="skeleton-shimmer mx-auto block h-3 w-24 rounded" />
      <span className="skeleton-shimmer mx-auto mt-6 block h-9 w-2/3 rounded" />
      <span className="skeleton-shimmer mx-auto mt-4 block h-4 w-1/2 rounded" />
    </div>
  </div>
);

export default RouteProgress;
