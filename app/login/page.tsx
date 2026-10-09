import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Log in",
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  // Already logged in? No need to see the login form (like Laravel's "guest" middleware)
  if (await getCurrentUser()) {
    redirect("/dashboard");
  }

  const { next } = await searchParams;

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Log in</h1>
      <p className="text-gray-600 mb-8">Use the same account as the Laravel Blog website.</p>

      <LoginForm next={next} />
    </div>
  );
}