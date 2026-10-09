"use client";

// Shown instead of the page when something throws (for example the Laravel API is down)
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <p className="text-6xl font-bold text-gray-300 mb-4">!</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-600 mb-8">{error.message}</p>
      <button onClick={reset} className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700">
        Try again
      </button>
    </div>
  );
}