import Form from "next/form";
import Link from "next/link";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
  q?: string;
  category?: string;
};

// GET search form. next/form changes the URL to /posts?q=...&category=... without a full page reload.
export default function SearchForm({ categories, q, category }: Props) {
  return (
    <Form action="/posts" className="flex flex-col sm:flex-row gap-3 mb-8">
      <input
        type="text"
        name="q"
        defaultValue={q}
        placeholder="Search posts..."
        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        name="category"
        defaultValue={category ?? ""}
        className="rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All categories</option>
        {categories.map((item) => (
          <option key={item.id} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>

      <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700">
        Search
      </button>

      {(q || category) && (
        <Link href="/posts" className="self-center text-sm text-gray-600 hover:underline">
          Clear
        </Link>
      )}
    </Form>
  );
}