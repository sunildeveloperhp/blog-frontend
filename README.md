# Laravel Blog — Next.js Frontend

The frontend for the [Laravel Blog](https://github.com/<your-github-username>/laravel-blog) project.
Built with Next.js (App Router), TypeScript and Tailwind CSS. All data comes from the Laravel REST API (`/api/v1`).

## Features

- Home page with the latest posts and categories
- Posts list with search, category filter and pagination
- Single post pages with image, tags and approved comments
- Log in with a Laravel Sanctum token stored in an **httpOnly cookie** (never readable by browser JavaScript)
- Protected dashboard: the user's own posts
- Create, edit and delete posts with image upload and tags, using Laravel's validation and permissions
- Comment form (comments wait for admin approval)
- Loading skeletons, a custom 404 page and an error page with retry

## How it works

```
Browser ──► Next.js (Server Components + Server Actions) ──► Laravel API ──► MySQL
```

- Pages are **Server Components**: they call the Laravel API on the server, so the API URL and the token never reach the browser.
- Forms use **Server Actions**. Laravel's 422 validation errors are shown under each field.
- Public data is cached with `revalidate`. Responses made with a user's token are never cached.
- The visitor's IP is passed to Laravel in `X-Client-IP`, signed with a shared secret, so Laravel's rate limits work per visitor.

## Requirements

- Node.js 20.9+
- The Laravel Blog API running (see its README)

## Setup

```bash
git clone https://github.com/<your-github-username>/blog-frontend.git
cd blog-frontend
npm install
```

Create `.env.local`:

```env
LARAVEL_API_URL=http://blog.test/api/v1
FRONTEND_SECRET=<the same value as FRONTEND_SECRET in the Laravel .env>
```

Run it:

```bash
npm run dev          # development, http://localhost:3000
npm run build        # production build
npm run start        # run the production build
```

Demo login: `admin@example.com` / `password` (from the Laravel seeder).

## Project structure

| Path | What it is |
|------|------------|
| `app/` | Pages and layouts (folder = URL) |
| `app/actions/` | Server Actions: login, logout, posts, comments |
| `components/` | Post card, forms, pagination, nav link |
| `lib/api.ts` | The only place that talks to the Laravel API |
| `lib/session.ts` | The httpOnly token cookie |
| `lib/auth.ts` | Current user, protected pages |
| `lib/types.ts` | TypeScript types matching the Laravel API Resources |