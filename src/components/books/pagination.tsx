import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildBooksHref } from "@/lib/catalog-url";
import type { CatalogQuery } from "@/lib/validations/catalog-query";
import { cn } from "@/lib/utils";

type PaginationProps = {
  query: CatalogQuery;
  page: number;
  totalPages: number;
};

function getPageItems(current: number, total: number): (number | "gap")[] {
  const pages = [
    ...new Set([1, total, current - 1, current, current + 1]),
  ]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push("gap");
    items.push(page);
  });
  return items;
}

const baseClass =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors";

export function Pagination({ query, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (target: number) => buildBooksHref(query, { page: target });

  return (
    <nav aria-label="Pagination" className="mt-14">
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link
              href={href(page - 1)}
              aria-label="Previous page"
              className={cn(baseClass, "text-ink hover:bg-muted")}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={cn(baseClass, "text-muted-foreground/50")}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              <span className="sr-only">Previous page (unavailable)</span>
            </span>
          )}
        </li>

        {getPageItems(page, totalPages).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={href(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  baseClass,
                  item === page
                    ? "bg-forest text-cream"
                    : "text-ink hover:bg-muted",
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}

        <li>
          {page < totalPages ? (
            <Link
              href={href(page + 1)}
              aria-label="Next page"
              className={cn(baseClass, "text-ink hover:bg-muted")}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className={cn(baseClass, "text-muted-foreground/50")}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
              <span className="sr-only">Next page (unavailable)</span>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}