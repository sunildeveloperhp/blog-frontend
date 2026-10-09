"use client";

import { useActionState } from "react";
import { addCommentAction } from "@/app/actions/comments";
import type { FormState } from "@/lib/types";

const initialState: FormState = {};

export default function CommentForm({ slug }: { slug: string }) {
  // bind() fixes the first argument (the slug), so the form only passes its data
  const [state, formAction, pending] = useActionState(addCommentAction.bind(null, slug), initialState);

  return (
    <form action={formAction} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      {state.success && (
        <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{state.message}</p>
      )}

      <label htmlFor="body" className="block text-sm font-medium text-gray-700">
        Leave a comment
      </label>
      <textarea
        id="body"
        name="body"
        rows={4}
        required
        maxLength={1000}
        defaultValue={state.success ? "" : state.values?.body}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {!state.success && state.message && (
        <p className="text-sm text-red-600">{state.errors?.body?.[0] ?? state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Posting..." : "Post comment"}
      </button>
    </form>
  );
}