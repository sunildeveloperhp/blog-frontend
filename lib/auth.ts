import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ApiError, apiGet } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { ApiItem, User } from "@/lib/types";

// The logged-in user, or null. cache() means the layout and the page share one API call per request.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) {
    return null;
  }

  try {
    const response = await apiGet<ApiItem<User>>("/user", { token });
    return response.data;
  } catch (error) {
    // 401 = the token expired (7 days) or was revoked: treat as logged out
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
});

// For protected pages: the logged-in user, or a redirect to the login page (like Laravel's "auth" middleware)
export async function requireUser(returnTo: string): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  return user;
}

// Can this user edit or delete this post? (A UI shortcut only: Laravel's PostPolicy is the real check.)
export function canManagePost(user: User | null, authorId: number | undefined): boolean {
  return user !== null && (user.role === "admin" || user.id === authorId);
}