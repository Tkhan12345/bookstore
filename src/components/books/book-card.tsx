import Link from "next/link";
import { BookCover } from "@/components/books/book-cover";
import { WishlistButton } from "@/components/books/wishlist-button";
import type { CatalogBook } from "@/features/catalog/catalog.types";
import {
  formatPrice,
  getAvailability,
  getDiscountPercent,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export type BookCardProps = {
  id: string;
  title: string;
  slug: string;
  author: string;
  pricePaise: number;
  compareAtPaise?: number | null;
  coverImage?: string | null;
  /** Pass `null` for "no inventory record"; omit to hide availability. */
  inventory?: { quantity: number; reservedQuantity: number } | null;
  className?: string;
};

export function bookToCardProps(book: CatalogBook): BookCardProps {
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    author: book.authors.map((a) => a.name).join(", ") || "Unknown author",
    pricePaise: book.pricePaise,
    compareAtPaise: book.compareAtPaise,
    coverImage: book.coverImage,
    inventory: book.inventory,
  };
}

const availabilityTone = {
  "in-stock": "text-forest",
  "low-stock": "text-[#7a5516]",
  "out-of-stock": "text-muted-foreground",
} as const;

export function BookCard({
  id,
  title,
  slug,
  author,
  pricePaise,
  compareAtPaise,
  coverImage,
  inventory,
  className,
}: BookCardProps) {
  const discount = getDiscountPercent(pricePaise, compareAtPaise);
  const availability =
    inventory === undefined ? null : getAvailability(inventory);

  return (
    <div className={cn("group relative", className)}>
      <Link href={`/books/${slug}`} className="block rounded-lg">
        <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-secondary/70 p-6 ring-1 ring-border transition-shadow duration-300 group-hover:shadow-md">
          <div className="w-[66%] transition-transform duration-300 ease-out group-hover:-translate-y-1.5">
            <BookCover
              title={title}
              author={author}
              coverImage={coverImage}
              decorative
            />
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="font-heading text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-forest">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{author}</p>

          <p className="flex flex-wrap items-baseline gap-x-2 pt-1">
            <span className="font-semibold text-forest">
              {formatPrice(pricePaise)}
            </span>
            {discount !== null && compareAtPaise ? (
              <>
                <s className="text-sm text-muted-foreground">
                  <span className="sr-only">Original price </span>
                  {formatPrice(compareAtPaise)}
                </s>
                <span className="text-xs font-medium text-forest">
                  {discount}% off
                </span>
              </>
            ) : null}
          </p>

          {availability ? (
            <p
              className={cn(
                "text-xs font-medium",
                availabilityTone[availability.status],
              )}
            >
              {availability.label}
            </p>
          ) : null}
        </div>
      </Link>

      <WishlistButton
        className="absolute right-3 top-3"
        book={{
          bookId: id,
          slug,
          title,
          author,
          pricePaise,
          compareAtPaise: compareAtPaise ?? null,
          coverImage: coverImage ?? null,
        }}
      />
    </div>
  );
}