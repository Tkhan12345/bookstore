import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { BookFilters } from "@/components/books/book-filters";
import { BookGrid } from "@/components/books/book-grid";
import { BookSort } from "@/components/books/book-sort";
import { CatalogSearch } from "@/components/books/catalog-search";
import { Pagination } from "@/components/books/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import {
  getCatalogBooks,
  getCategories,
} from "@/features/catalog/catalog.service";
import {
  parseCatalogQuery,
  type RawSearchParams,
} from "@/lib/validations/catalog-query";

export const metadata: Metadata = {
  title: "All books",
  description: "Browse the full BookStore shelf by genre, price and more.",
};

type BooksPageProps = {
  searchParams: Promise<RawSearchParams>;
};

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const query = parseCatalogQuery(await searchParams);
  const [result, categories] = await Promise.all([
    getCatalogBooks(query),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === query.category);
  const hasFilters = Boolean(
    query.q ||
      query.category ||
      query.minPrice !== undefined ||
      query.maxPrice !== undefined,
  );

  const title = activeCategory
    ? activeCategory.name
    : query.q
      ? `Results for “${query.q}”`
      : "All books";

  const rangeStart = (result.page - 1) * result.pageSize + 1;
  const rangeEnd = rangeStart + result.books.length - 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <SectionHeading
        as="h1"
        eyebrow="The shelf"
        title={title}
        description="Find a book for every mood and moment."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
        <BookFilters query={query} categories={categories} />

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Suspense
              fallback={
                <div className="h-10 w-full rounded-md border border-input bg-white sm:max-w-md" />
              }
            >
              <div className="w-full sm:max-w-md">
                <CatalogSearch />
              </div>
              <BookSort value={query.sort} />
            </Suspense>
          </div>

          <p
            role="status"
            className="mt-6 text-sm text-muted-foreground"
          >
            {result.total === 0
              ? "No books match."
              : `Showing ${rangeStart}–${rangeEnd} of ${result.total} ${
                  result.total === 1 ? "book" : "books"
                }`}
          </p>

          <div className="mt-6">
            {result.total === 0 ? (
              <EmptyState
                icon={SearchX}
                title={hasFilters ? "No books found" : "The shelf is empty for now"}
                description={
                  hasFilters
                    ? "Nothing matches those filters. Try a different search, genre or price range."
                    : "New books will appear here as soon as they are added."
                }
                action={
                  hasFilters ? (
                    <Button asChild variant="outline" className="h-10 px-5">
                      <Link href="/books">Clear all filters</Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <BookGrid books={result.books} />
            )}
          </div>

          <Pagination
            query={query}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </div>
    </div>
  );
}