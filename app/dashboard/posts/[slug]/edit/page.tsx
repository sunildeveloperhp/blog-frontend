import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updatePostAction } from "@/app/actions/posts";
import PostForm from "@/components/post-form";
import { ApiError, apiGet } from "@/lib/api";
import { canManagePost, requireUser } from "@/lib/auth";
import type { ApiCollection, ApiItem, Category, Post, Tag } from "@/lib/types";
 

export const metadata: Metadata = {
  title: "Edit Post",
};

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { slug } = await params;
  const user = await requireUser(`/dashboard/posts/${slug}/edit`);

  let post: Post;
  try {
    // No caching here: the form must show the latest saved version
    const response = await apiGet<ApiItem<Post>>(`/posts/${encodeURIComponent(slug)}`);
    post = response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  if (!canManagePost(user, post.author?.id)) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-6xl font-bold text-gray-300 mb-4">403</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You can&apos;t edit this post</h1>
        <p className="text-gray-600">Only its author or an admin can change it.</p>
      </div>
    );
  }

  const [categories, tags] = await Promise.all([
    apiGet<ApiCollection<Category>>("/categories", { revalidate: 300 }),
    apiGet<ApiCollection<Tag>>("/tags", { revalidate: 300 }),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit post</h1>
      <PostForm
        action={updatePostAction.bind(null, slug)}
        categories={categories.data}
        tags={tags.data}
        post={post}
        submitLabel="Update post"
      />
    </div>
  );
}