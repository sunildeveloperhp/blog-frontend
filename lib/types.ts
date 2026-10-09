// Shapes of the JSON that the Laravel API returns (they match the API Resources)

export type ApiInfo = {
  name: string;
  version: string;
};

export type Author = {
  id: number;
  name: string;
  url: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  posts_count?: number;
  url: string;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
  url: string;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body?: string; // only on the single post endpoint
  featured_image_url: string | null;
  published_at: string | null;
  comments_count?: number;
  author?: Author;
  category?: Category;
  tags?: Tag[];
  url: string;
};

export type Comment = {
  id: number;
  body: string;
  approved: boolean;
  created_at: string;
  author?: Author;
};

// One item: { data: {...} }
export type ApiItem<T> = {
  data: T;
};

// A list without pagination: { data: [...] }
export type ApiCollection<T> = {
  data: T[];
};

// The "meta" block of a paginated Laravel response
export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

// A paginated list: { data: [...], links: {...}, meta: {...} }
export type Paginated<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: PaginationMeta;
};


// The logged-in user's own account (GET /api/v1/user -> UserResource)
export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "author" | "reader";
  email_verified: boolean;
  created_at: string | null;
};

// What a Server Action sends back to its form
export type FormState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>; // Laravel's 422 "errors" object
  values?: Record<string, string | string[]>; // what the user typed, to refill the form
};