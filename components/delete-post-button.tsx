"use client";

import { deletePostAction } from "@/app/actions/posts";

// A small form, because deleting must be a POST (never a plain link)
export default function DeletePostButton({ slug, title }: { slug: string; title: string }) {
  return (
    <form
      action={deletePostAction.bind(null, slug)}
      onSubmit={(event) => {
        if (!confirm(`Delete "${title}"?`)) {
          event.preventDefault();
        }
      }}
      className="inline"
    >
      <button type="submit" className="text-red-600 hover:underline">
        Delete
      </button>
    </form>
  );
}