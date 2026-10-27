import { DEFAULT_SORT, type CatalogQuery } from "@/lib/validations/catalog-query";

/**
 * Builds a /books URL from the current query plus overrides.
 * Pass `undefined` for a key in `overrides` to remove it.
 * Defaults (sort=newest, page=1) are omitted to keep URLs clean.
 */
export function buildBooksHref(
  query: CatalogQuery,
  overrides: Partial<CatalogQuery> = {},
): string {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  if (next.minPrice !== undefined) params.set("minPrice", String(next.minPrice));
  if (next.maxPrice !== undefined) params.set("maxPrice", String(next.maxPrice));
  if (next.sort !== DEFAULT_SORT) params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const qs = params.toString();
  return qs ? `/books?${qs}` : "/books";
}