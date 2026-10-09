"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { FormState } from "@/lib/types";

// slug comes first because the form binds it: addCommentAction.bind(null, slug)
export async function addCommentAction(slug: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const token = await getToken();
  if (!token) {
    redirect(`/login?next=/posts/${encodeURIComponent(slug)}`);
  }

  const body = String(formData.get("body") ?? "");

  try {
    const result = await apiRequest<{ message: string }>(`/posts/${encodeURIComponent(slug)}/comments`, {
      method: "POST",
      token,
      body: { body },
    });

    // Show the new comment straight away if it's already approved (admin comments)
    revalidatePath(`/posts/${slug}`);

    return { success: true, message: result.message };
  } catch (error) {
    // 403 = email not verified, 422 = validation, 429 = more than 5 comments a minute
    if (error instanceof ApiError && [403, 422, 429].includes(error.status)) {
      return { message: error.message, errors: error.errors, values: { body } };
    }
    throw error;
  }
}