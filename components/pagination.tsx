import Link from "next/link";
import type { PaginationMeta } from "@/lib/types";

type Props = {
  meta: PaginationMeta;
  basePath: string;
  // Filters to keep in every page link, e.g. { q: "laravel", category: "php" }
  query?: Record<string, string | undefined>;
};

// Page links built from Laravel's "meta" block (like $posts->links() in Blade)
export default function Pagination({ meta, basePath, query = {} }: Props) {
  if (meta.last_page <= 1) {
    return null;
  }

  function hrefFor(page: number): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (value) {
        params.set(key, value);
      }
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  }

  const pages = Array.from({ length: meta.last_page }, (_, index) => index + 1);
  const base = "px-3 py-1.5 rounded-md border text-sm";

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination">
      {meta.current_page > 1 ? (
        <Link href={hrefFor(meta.current_page - 1)} className={`${base} border-gray-300 bg-white hover:bg-gray-50`}>
          &larr; Previous
        </Link>
      ) : (
        <span className={`${base} border-gray-200 text-gray-400`}>&larr; Previous</span>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={hrefFor(page)}
          aria-current={page === meta.current_page ? "page" : undefined}
          className={
            page === meta.current_page
              ? `${base} border-blue-600 bg-blue-600 text-white`
              : `${base} border-gray-300 bg-white hover:bg-gray-50`
          }
        >
          {page}
        </Link>
      ))}

      {meta.current_page < meta.last_page ? (
        <Link href={hrefFor(meta.current_page + 1)} className={`${base} border-gray-300 bg-white hover:bg-gray-50`}>
          Next &rarr;
        </Link>
      ) : (
        <span className={`${base} border-gray-200 text-gray-400`}>Next &rarr;</span>
      )}

      <span className="ml-2 text-sm text-gray-500">
        Page {meta.current_page} of {meta.last_page}
      </span>
    </nav>
  );
}