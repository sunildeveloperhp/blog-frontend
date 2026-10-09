// Shown instantly while a /posts page waits for the Laravel API
export default function Loading() {
  return (
    <div className="grid gap-6 md:grid-cols-2" aria-busy="true" aria-label="Loading posts">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-lg border border-gray-200 bg-white overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-100" />
          <div className="p-6 space-y-3">
            <div className="h-3 w-1/3 rounded bg-gray-100" />
            <div className="h-5 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}