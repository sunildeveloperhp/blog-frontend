import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/types";

// The same card design as the Laravel x-post-card component
export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition">
      <Link href={`/posts/${post.slug}`} className="block">
        {post.featured_image_url ? (
          // A plain <img> for now: next/image needs extra settings for local domains like blog.test
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featured_image_url} alt={post.title} className="w-full h-48 object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-sm font-semibold uppercase tracking-wide text-gray-400">
            {post.category?.name}
          </div>
        )}
      </Link>

      <div className="p-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          {post.category && (
            <Link
              href={`/posts?category=${post.category.slug}`}
              className="font-semibold uppercase tracking-wide text-blue-600 hover:underline"
            >
              {post.category.name}
            </Link>
          )}
          <span>&middot;</span>
          <span>{formatDate(post.published_at)}</span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          <Link href={`/posts/${post.slug}`} className="hover:text-blue-600">
            {post.title}
          </Link>
        </h2>

        <p className="text-gray-600">{post.excerpt}</p>

        {post.author && <p className="text-sm text-gray-500 mt-4">By {post.author.name}</p>}
      </div>
    </article>
  );
}