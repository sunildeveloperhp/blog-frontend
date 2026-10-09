import Link from "next/link";

// Shown for unknown URLs and whenever a page calls notFound()
export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <p className="text-6xl font-bold text-gray-300 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-600 mb-8">
        The post or page you&apos;re looking for doesn&apos;t exist or isn&apos;t published yet.
      </p>
      <Link href="/posts" className="text-blue-600 font-medium hover:underline">
        &larr; Browse all posts
      </Link>
    </div>
  );
}