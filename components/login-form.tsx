"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import type { FormState } from "@/lib/types";

const initialState: FormState = {};

export default function LoginForm({ next }: { next?: string }) {
  // state = what loginAction returned last time, pending = true while it runs
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
      <input type="hidden" name="next" value={next ?? ""} />

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          autoFocus
          autoComplete="email"
          defaultValue={state.values?.email}
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state.errors?.email && <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state.errors?.password && <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>}
      </div>

      {/* Errors without a field, e.g. 429 "Too many requests" */}
      {state.message && !state.errors?.email && !state.errors?.password && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}