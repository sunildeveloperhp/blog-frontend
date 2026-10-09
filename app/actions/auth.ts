"use server";

import { redirect } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/session";
import type { FormState } from "@/lib/types";

// Only allow local paths like "/dashboard" as the place to go after login.
// Blocks "https://evil.com", "//evil.com" and "/\evil.com" (an "open redirect").
function safeRedirectPath(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value : "";

  if (path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\")) {
    return path;
  }

  return "/dashboard";
}

export async function loginAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const result = await apiRequest<{ token: string }>("/login", {
      method: "POST",
      body: { email, password, device_name: "nextjs" },
    });

    await setToken(result.token);
  } catch (error) {
    // 422 = wrong email/password or empty fields, 429 = too many attempts
    if (error instanceof ApiError && (error.status === 422 || error.status === 429)) {
      return { message: error.message, errors: error.errors, values: { email } };
    }
    throw error;
  }

  // redirect() must be outside try/catch: it works by throwing a special error
  redirect(safeRedirectPath(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  const token = await getToken();

  if (token) {
    try {
      // Delete the token in Laravel too, so it can never be used again
      await apiRequest("/logout", { method: "POST", token });
    } catch {
      // The token may already be expired. We still log out on this side.
    }
  }

  await clearToken();
  redirect("/");
}