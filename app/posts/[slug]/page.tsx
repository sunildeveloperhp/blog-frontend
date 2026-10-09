import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import CommentForm from "@/components/comment-form";
import { ApiError, apiGet } from "@/lib/api";
import { canManagePost, getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { ApiItem, Comment, Paginated, Post } from "@/lib/types";

type Props = {
  params: Promise<{ slug: string }>;
};

// Get one post. Laravel's 404 ("Post not found.") becomes Next.js's not-found page.
// cache() makes generateMetadata and the page share one request instead of two.
const getPost = cache(async (slug: string): Promise<Post> => {
  try {
    const response = await apiGet<ApiItem<Post>>(`/posts/${encodeURIComponent(slug)}`, { revalidate: 60 });
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
});

// The browser tab title and the Google/social preview text come from the post itself
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  const comments = await apiGet<Paginated<Comment>>(`/posts/${encodeURIComponent(slug)}/comments`);
  const user = await getCurrentUser();

  return (
    <>
      <article className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden">
        {post.featured_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featured_image_url} alt={post.title} className="w-full max-h-[28rem] object-cover" />
        )}

        <div className="p-8">
          {post.category && (
            <Link
              href={`/posts?category=${post.category.slug}`}
              className="text-xs font-semibold uppercase tracking-wide text-blue-600 hover:underline"
            >
              {post.category.name}
            </Link>
          )}

          {canManagePost(user, post.author?.id) && (
            <Link
              href={`/dashboard/posts/${post.slug}/edit`}
              className="float-right text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200"
            >
              Edit this post
            </Link>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-3">{post.title}</h1>

          <p className="text-sm text-gray-500 mb-8">
            By {post.author?.name} &middot; {formatDate(post.published_at)}
          </p>

          <div className="text-gray-700 leading-relaxed whitespace-pre-line">{post.body}</div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag.id} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      <section id="comments" className="max-w-3xl mx-auto mt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Comments ({comments.meta.total})</h2>

        <div className="space-y-4 mb-8">
          {comments.data.length > 0 ? (
            comments.data.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-gray-900">{comment.author?.name}</span>
                  <span className="text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{comment.body}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>

        {user ? (
          <CommentForm slug={post.slug} />
        ) : (
          <p className="text-gray-600">
            <Link href={`/login?next=/posts/${post.slug}`} className="text-blue-600 hover:underline">
              Log in
            </Link>{" "}
            to leave a comment.
          </p>
        )}
      </section>

      <div className="max-w-3xl mx-auto mt-10">
        <Link href="/posts" className="text-blue-600 font-medium hover:underline">
          &larr; Back to all posts
        </Link>
      </div>
    </>
  );
}