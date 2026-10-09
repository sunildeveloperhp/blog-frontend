"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { ApiItem, FormState, Post } from "@/lib/types";

// The logged-in user's token, or a redirect to the login page
async function requireToken(returnTo: string): Promise<string> {
  const token = await getToken();

  if (!token) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  return token;
}

// Build the multipart data Laravel's PostRequest expects
function toLaravelFormData(formData: FormData, isUpdate: boolean): FormData {
  const data = new FormData();

  for (const field of ["title", "category_id", "excerpt", "body"]) {
    data.append(field, String(formData.get(field) ?? ""));
  }

  const tagIds = formData.getAll("tags").map(String);
  if (tagIds.length > 0) {
    tagIds.forEach((id) => data.append("tags[]", id));
  } else if (isUpdate) {
    data.append("tags", ""); // nothing ticked on the edit form = remove all tags
  }

  // An empty file input still sends a File with size 0, so check the size
  const image = formData.get("featured_image");
  if (image instanceof File && image.size > 0) {
    data.append("featured_image", image);
  }

  if (formData.get("remove_image") === "1") {
    data.append("remove_image", "1");
  }

  // PHP can't read multipart data on a real PUT request, so send POST and tell Laravel it's a PUT
  if (isUpdate) {
    data.append("_method", "PUT");
  }

  return data;
}

// What the user typed, so the form can show it again after an error
function typedValues(formData: FormData): Record<string, string | string[]> {
  return {
    title: String(formData.get("title") ?? ""),
    category_id: String(formData.get("category_id") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    body: String(formData.get("body") ?? ""),
    tags: formData.getAll("tags").map(String),
  };
}

// Laravel errors that belong on the form: 403 forbidden / not verified, 413 too large, 422 validation, 429 throttled
function toFormState(error: unknown, formData: FormData): FormState {
  if (error instanceof ApiError && [403, 413, 422, 429].includes(error.status)) {
    return { message: error.message, errors: error.errors, values: typedValues(formData) };
  }
  throw error;
}

export async function createPostAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken("/dashboard/posts/new");

  let post: Post;
  try {
    const response = await apiRequest<ApiItem<Post>>("/posts", {
      method: "POST",
      token,
      formData: toLaravelFormData(formData, false),
    });
    post = response.data;
  } catch (error) {
    return toFormState(error, formData);
  }

  // The new post must show up on the home page and the posts list straight away
  revalidatePath("/", "layout");
  redirect(`/posts/${post.slug}`);
}

// slug comes first because the edit page binds it: updatePostAction.bind(null, slug)
export async function updatePostAction(slug: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const token = await requireToken(`/dashboard/posts/${slug}/edit`);

  try {
    await apiRequest<ApiItem<Post>>(`/posts/${encodeURIComponent(slug)}`, {
      method: "POST", // + _method=PUT inside the form data
      token,
      formData: toLaravelFormData(formData, true),
    });
  } catch (error) {
    return toFormState(error, formData);
  }

  revalidatePath("/", "layout");
  redirect(`/posts/${slug}`); // the slug never changes on edit (same rule as the website)
}

export async function deletePostAction(slug: string): Promise<void> {
  const token = await requireToken("/dashboard");

  try {
    await apiRequest(`/posts/${encodeURIComponent(slug)}`, { method: "DELETE", token });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
      redirect("/dashboard?status=not-allowed");
    }
    throw error;
  }

  revalidatePath("/", "layout");
  redirect("/dashboard?status=deleted");
}