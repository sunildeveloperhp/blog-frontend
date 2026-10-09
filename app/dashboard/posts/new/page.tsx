import type { Metadata } from "next";
import { createPostAction } from "@/app/actions/posts";
import PostForm from "@/components/post-form";
import { apiGet } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import type { ApiCollection, Category, Tag } from "@/lib/types";

export const metadata: Metadata = {
  title: "New Post",
};

export default async function NewPostPage() {
  const user = await requireUser("/dashboard/posts/new");

  // Readers can't write posts (Laravel's PostPolicy@create says the same)
  if (user.role === "reader") {
    return (
      <div className="max-w-md mx-auto rounded-lg border border-amber-200 bg-amber-50 p-8 text-amber-800">
        Your account is a <strong>Reader</strong> account, so you can&apos;t write posts.
      </div>
    );
  }

  const [categories, tags] = await Promise.all([
    apiGet<ApiCollection<Category>>("/categories", { revalidate: 300 }),
    apiGet<ApiCollection<Tag>>("/tags", { revalidate: 300 }),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Write a new post</h1>
      <PostForm action={createPostAction} categories={categories.data} tags={tags.data} submitLabel="Publish post" />
    </div>
  );
}