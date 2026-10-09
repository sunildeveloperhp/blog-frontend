"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Category, FormState, Post, Tag } from "@/lib/types";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  categories: Category[];
  tags: Tag[];
  post?: Post; // given on the edit page, empty on the create page
  submitLabel: string;
};

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

// Shared by "New post" and "Edit post" (like the _form.blade.php partial)
export default function PostForm({ action, categories, tags, post, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  // After an error: what the user typed. Otherwise: the saved post (edit) or empty (create).
  function text(key: string, fallback = ""): string {
    const value = state.values?.[key];
    return typeof value === "string" ? value : fallback;
  }

  const typedTags = state.values?.tags;
  const selectedTags = Array.isArray(typedTags) ? typedTags : (post?.tags ?? []).map((tag) => String(tag.id));

  // Laravel sends a list of messages per field; show the first one
  function error(key: string): string | undefined {
    return state.errors?.[key]?.[0];
  }

  const tagsError =
    error("tags") ??
    Object.entries(state.errors ?? {}).find(([key]) => key.startsWith("tags."))?.[1]?.[0];

  const hasFieldErrors = Object.keys(state.errors ?? {}).length > 0;

  return (
    <form action={formAction} className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
      {/* Errors that belong to no field: 403 not verified / reader, 413 too large, 429 too many */}
      {state.message && !hasFieldErrors && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{state.message}</p>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input id="title" name="title" type="text" required defaultValue={text("title", post?.title)} className={inputClass} />
        {error("title") && <p className="mt-1 text-sm text-red-600">{error("title")}</p>}
      </div>

      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          defaultValue={text("category_id", post?.category ? String(post.category.id) : "")}
          className={inputClass}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {error("category_id") && <p className="mt-1 text-sm text-red-600">{error("category_id")}</p>}
      </div>

      <div>
        <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 mb-1">
          Featured image
        </label>

        {post?.featured_image_url && (
          <div className="mb-3 flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featured_image_url}
              alt="Current featured image"
              className="w-40 h-24 object-cover rounded-md border border-gray-200"
            />
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="remove_image" value="1" className="rounded border-gray-300" />
              Remove current image
            </label>
          </div>
        )}

        <input
          id="featured_image"
          name="featured_image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="mt-1 text-xs text-gray-500">JPG, PNG or WebP, up to 2 MB.</p>
        {error("featured_image") && <p className="mt-1 text-sm text-red-600">{error("featured_image")}</p>}
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
          Excerpt
        </label>
        <textarea id="excerpt" name="excerpt" rows={2} required defaultValue={text("excerpt", post?.excerpt)} className={inputClass} />
        {error("excerpt") && <p className="mt-1 text-sm text-red-600">{error("excerpt")}</p>}
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
          Body
        </label>
        <textarea id="body" name="body" rows={12} required defaultValue={text("body", post?.body)} className={inputClass} />
        {error("body") && <p className="mt-1 text-sm text-red-600">{error("body")}</p>}
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          Tags <span className="text-gray-400 font-normal">(up to 5)</span>
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {tags.map((tag) => (
            <label key={tag.id} className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="tags"
                value={tag.id}
                defaultChecked={selectedTags.includes(String(tag.id))}
                className="rounded border-gray-300"
              />
              {tag.name}
            </label>
          ))}
        </div>
        {tagsError && <p className="mt-1 text-sm text-red-600">{tagsError}</p>}
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
        <Link href="/dashboard" className="text-gray-600 hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}