import Form from "next/form";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavCategory } from "@/features/catalog/catalog.types";
import { buildBooksHref } from "@/lib/catalog-url";
import type { CatalogQuery } from "@/lib/validations/catalog-query";
import { cn } from "@/lib/utils";

type BookFiltersProps = {
  query: CatalogQuery;
  categories: NavCategory[];
};

type FilterPanelProps = BookFiltersProps & { idPrefix: string };

function FilterPanel({ query, categories, idPrefix }: FilterPanelProps) {
  const hasFilters = Boolean(
    query.q ||
      query.category ||
      query.minPrice !== undefined ||
      query.maxPrice !== undefined,
  );

  const genreLinkClass = (active: boolean) =>
    cn(
      "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
      active
        ? "bg-forest font-medium text-cream"
        : "text-ink/80 hover:bg-muted hover:text-forest",
    );

  return (
    <div className="space-y-8">
      <section aria-labelledby={`${idPrefix}-genre-heading`}>
        <h2
          id={`${idPrefix}-genre-heading`}
          className="font-heading text-lg font-semibold text-forest"
        >
          Genre
        </h2>
        <ul className="mt-3 space-y-1">
          <li>
            <Link
              href={buildBooksHref(query, { category: undefined, page: 1 })}
              aria-current={query.category ? undefined : "true"}
              className={genreLinkClass(!query.category)}
            >
              All genres
            </Link>
          </li>
          {categories.map((category) => {
            const active = query.category === category.slug;
            return (
              <li key={category.id}>
                <Link
                  href={buildBooksHref(query, {
                    category: category.slug,
                    page: 1,
                  })}
                  aria-current={active ? "true" : undefined}
                  className={genreLinkClass(active)}
                >
                  <span>{category.name}</span>
                  <span
                    className={cn(
                      "text-xs",
                      active ? "text-sage" : "text-muted-foreground",
                    )}
                  >
                    {category.bookCount}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby={`${idPrefix}-price-heading`}>
        <h2
          id={`${idPrefix}-price-heading`}
          className="font-heading text-lg font-semibold text-forest"
        >
          Price (₹)
        </h2>
        <Form action="/books" className="mt-3 space-y-3">
          {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
          {query.category ? (
            <input type="hidden" name="category" value={query.category} />
          ) : null}
          <input type="hidden" name="sort" value={query.sort} />

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label htmlFor={`${idPrefix}-min`} className="sr-only">
                Minimum price in rupees
              </label>
              <input
                id={`${idPrefix}-min`}
                name="minPrice"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="Min"
                defaultValue={query.minPrice}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/25"
              />
            </div>
            <span aria-hidden="true" className="text-muted-foreground">
              –
            </span>
            <div className="flex-1">
              <label htmlFor={`${idPrefix}-max`} className="sr-only">
                Maximum price in rupees
              </label>
              <input
                id={`${idPrefix}-max`}
                name="maxPrice"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="Max"
                defaultValue={query.maxPrice}
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-forest focus:ring-2 focus:ring-forest/25"
              />
            </div>
          </div>
          <Button type="submit" variant="outline" className="h-10 w-full">
            Apply price range
          </Button>
        </Form>
      </section>

      {hasFilters ? (
        <Link
          href="/books"
          className="inline-block text-sm font-medium text-forest underline underline-offset-4"
        >
          Clear all filters
        </Link>
      ) : null}
    </div>
  );
}

export function BookFilters({ query, categories }: BookFiltersProps) {
  return (
    <aside aria-label="Filters">
      {/* Mobile and tablet: collapsible */}
      <details className="rounded-lg border border-border bg-white lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-forest">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
        </summary>
        <div className="border-t border-border p-4">
          <FilterPanel query={query} categories={categories} idPrefix="m" />
        </div>
      </details>

      {/* Desktop: always visible */}
      <div className="hidden lg:block">
        <FilterPanel query={query} categories={categories} idPrefix="d" />
      </div>
    </aside>
  );
}