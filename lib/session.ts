import "server-only";
import { cookies } from "next/headers";

const COOKIE_NAME = "blog_token";
const SEVEN_DAYS = 60 * 60 * 24 * 7; // same as the Sanctum token expiry in Laravel

// Read the Sanctum token from the cookie (undefined when logged out)
export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

// Save the token after login. Only allowed inside Server Actions.
export async function setToken(token: string): Promise<void> {
  const store = await cookies();

  store.set(COOKIE_NAME, token, {
    httpOnly: true, // JavaScript in the browser can't read it (protects against XSS)
    secure: process.env.NODE_ENV === "production", // HTTPS only on the live site
    sameSite: "lax", // not sent with form posts from other websites (protects against CSRF)
    path: "/",
    maxAge: SEVEN_DAYS,
  });
}

// Remove the token on logout. Only allowed inside Server Actions.
export async function clearToken(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}