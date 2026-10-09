import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import NavLink from "@/components/nav-link";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Laravel Blog",
    template: "%s | Laravel Blog",
  },
  description: "Tutorials and notes on Laravel, PHP and web development.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-gray-50 text-gray-800 min-h-screen flex flex-col`}
      >
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Laravel Blog
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/posts">Posts</NavLink>

              {user ? (
                <>
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-700">{user.name}</span>
                  <form action={logoutAction}>
                    <button type="submit" className="text-gray-600 hover:text-gray-900">
                      Log out
                    </button>
                  </form>
                </>
              ) : (
                <NavLink href="/login">Log in</NavLink>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-10">{children}</main>

        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Laravel Blog. Frontend built with Next.js.
          </div>
        </footer>
      </body>
    </html>
  );
}