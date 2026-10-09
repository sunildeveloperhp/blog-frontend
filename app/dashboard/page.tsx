import type { Metadata } from "next";
import Link from "next/link";
import DeletePostButton from "@/components/delete-post-button";
import { apiGet } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getToken } from "@/lib/session";
import type { Paginated, Post } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard",
};

type Props = {
  searchParams: Promise<{ status?: string }>;
};

// Messages passed in the URL after a redirect (Next.js has no session flash messages)
const statusMessages: Record<string, { text: string; className: string }> = {
  deleted: { text: "The post was moved to trash.", className: "border-green-200 bg-green-50 text-green-800" },
  "not-allowed": { text: "You can't delete that post.", className: "border-red-200 bg-red-50 text-red-800" },
};

export default async function DashboardPage({ searchParams }: Props) {
  const user = await requireUser("/dashboard");
  const { status } = await searchParams;
  const flash = status ? statusMessages[status] : undefined;

  // The Laravel API only lets verified users manage posts (the "verified" middleware)
  if (!user.email_verified) {
    return (
      <div className="max-w-md mx-auto rounded-lg border border-amber-200 bg-amber-50 p-8 text-amber-800">
        <h1 className="text-xl font-bold mb-2">Verify your email first</h1>
        <p>Open the verification link we emailed to {user.email}, then come back.</p>
      </div>
    );
  }

  const token = await getToken();
  const posts = await apiGet<Paginated<Post>>("/my/posts", { token });

  return (
    <>
      {flash && <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${flash.className}`}>{flash.text}</div>}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Posts <span className="text-lg font-normal text-gray-500">({posts.meta.total})</span>
        </h1>

        {user.role !== "reader" && (
          <Link
            href="/dashboard/posts/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            + New post
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.data.length > 0 ? (
              posts.data.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-3">
                    <Link href={`/posts/${post.slug}`} className="font-medium text-gray-900 hover:text-blue-600">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{post.category?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(post.published_at)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/dashboard/posts/${post.slug}/edit`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <span className="mx-2 text-gray-300">|</span>
                    <DeletePostButton slug={post.slug} title={post.title} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  You haven&apos;t written any posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}