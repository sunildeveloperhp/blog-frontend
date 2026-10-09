import Link from "next/link";
import PostCard from "@/components/post-card";
import { apiGet } from "@/lib/api";
import type { ApiCollection, Category, Paginated, Post } from "@/lib/types";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    apiGet<Paginated<Post>>("/posts"),
    apiGet<ApiCollection<Category>>("/categories", { revalidate: 300 }),
  ]);

  const latestPosts = posts.data.slice(0, 3);

  return (
    <>
      <section className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to Laravel Blog</h1>
        <p className="text-lg text-gray-600">Tutorials and notes on Laravel, PHP and web development.</p>
      </section>

      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Latest posts</h2>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {latestPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <Link href="/posts" className="inline-block mb-12 text-blue-600 font-medium hover:underline">
        View all posts &rarr;
      </Link>

      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Categories</h2>

      <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {categories.data.map((category) => (
          <li key={category.id}>
            <Link
              href={`/posts?category=${category.slug}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:shadow-sm"
            >
              <span className="font-medium text-gray-900">{category.name}</span>
              <span className="text-sm text-gray-500">{category.posts_count ?? 0} posts</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}