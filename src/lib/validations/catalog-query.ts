import { z } from "zod";

export const SORT_OPTIONS = [
  "newest",
  "price-asc",
  "price-desc",
  "title-asc",
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export const DEFAULT_SORT: SortOption = "newest";

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  "title-asc": "Title: A to Z",
};

/** Whole-rupee amounts from the URL; anything invalid is ignored. */
const rupees = z
  .string()
  .regex(/^\d{1,7}$/)
  .transform(Number)
  .optional()
  .catch(undefined);

const catalogQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(100)
    .transform((value) => value || undefined)
    .optional()
    .catch(undefined),
  category: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{1,80}$/)
    .optional()
    .catch(undefined),
  sort: z.enum(SORT_OPTIONS).catch(DEFAULT_SORT),
  minPrice: rupees,
  maxPrice: rupees,
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

export type CatalogQuery = z.infer<typeof catalogQuerySchema>;

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parses Next.js `searchParams` into a safe, fully-defaulted query. */
export function parseCatalogQuery(raw: RawSearchParams): CatalogQuery {
  const parsed = catalogQuerySchema.parse({
    q: first(raw.q),
    category: first(raw.category),
    sort: first(raw.sort),
    minPrice: first(raw.minPrice),
    maxPrice: first(raw.maxPrice),
    page: first(raw.page),
  });

  if (
    parsed.minPrice !== undefined &&
    parsed.maxPrice !== undefined &&
    parsed.minPrice > parsed.maxPrice
  ) {
    return { ...parsed, minPrice: parsed.maxPrice, maxPrice: parsed.minPrice };
  }

  return parsed;
}