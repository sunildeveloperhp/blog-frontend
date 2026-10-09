import "server-only";
import { headers } from "next/headers";

const API_URL = process.env.LARAVEL_API_URL;
const FRONTEND_SECRET = process.env.FRONTEND_SECRET;

// Thrown when Laravel answers with an error status (401, 403, 404, 422, 429, 500...)
export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown; // sent as JSON
  formData?: FormData; // sent as multipart/form-data (needed for file uploads)
  token?: string; // Sanctum token of the logged-in user
  revalidate?: number; // seconds to cache (public GET requests only)
};

// The visitor's IP address, from the headers the hosting platform adds (e.g. Vercel)
async function visitorIp(): Promise<string | undefined> {
  try {
    const requestHeaders = await headers();
    const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || requestHeaders.get("x-real-ip") || undefined;
  } catch {
    return undefined; // called outside a request, for example during "next build"
  }
}

// Call any Laravel API endpoint
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new Error("LARAVEL_API_URL is not set in .env.local");
  }

  const { method = "GET", body, formData, token, revalidate } = options;

  const requestHeaders: Record<string, string> = { Accept: "application/json" };
  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (formData) {
    // No Content-Type here: fetch adds "multipart/form-data" with the right boundary itself
    requestBody = formData;
  } else if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  // Only public GET requests may be cached. A response made with someone's token
  // must NEVER be cached, or the next visitor could see that person's private data.
  const cacheable = method === "GET" && !token && revalidate !== undefined;

  // Tell Laravel who the real visitor is (for rate limits and security logs).
  // Not on cached requests: those are shared by all visitors, and a per-visitor header would split the cache.
  if (!cacheable && FRONTEND_SECRET) {
    const ip = await visitorIp();
    if (ip) {
      requestHeaders["X-Client-IP"] = ip;
      requestHeaders["X-Frontend-Secret"] = FRONTEND_SECRET;
    }
  }

  const init: RequestInit = { method, headers: requestHeaders, body: requestBody };

  if (cacheable) {
    init.next = { revalidate };
  } else {
    init.cache = "no-store";
  }

  const response = await fetch(`${API_URL}${path}`, init);

  if (response.status === 204) {
    return undefined as T; // e.g. logout or delete: success with no body
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      data?.message ?? `Request failed with status ${response.status}`,
      data?.errors ?? {},
    );
  }

  return response.json() as Promise<T>;
}

// Shortcut for GET requests
export function apiGet<T>(path: string, options: { revalidate?: number; token?: string } = {}): Promise<T> {
  return apiRequest<T>(path, { ...options, method: "GET" });
}