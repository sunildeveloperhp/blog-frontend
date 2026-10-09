// "2026-10-04T03:18:49+00:00" -> "4 Oct 2026"
export function formatDate(iso: string | null): string {
  if (!iso) {
    return "Draft";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}