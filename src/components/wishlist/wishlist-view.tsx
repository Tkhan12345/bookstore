"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { BookCover } from "@/components/books/book-cover";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/shared/toast-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { useLiveStatuses } from "@/hooks/use-live-statuses";
import { useWishlist } from "@/hooks/use-wishlist";
import { describeAddResult } from "@/lib/cart-toast";
import { formatPrice, getAvailability } from "@/lib/format";
import { cn } from "@/lib/utils";

export function WishlistView() {
  const hydrated = useHydrated();
  const { items, remove } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { statuses, loading, failed, retry } = useLiveStatuses(
    items.map((item) => item.bookId),
  );

  if (!hydrated) {
    return (
      <ul
        role="status"
        aria-label="Loading wishlist"
        className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index}>
            <Skeleton className="aspect-[4/5] w-full rounded-lg" />
            <Skeleton className="mt-4 h-5 w-4/5" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </li>
        ))}
      </ul>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart on any book to save it here for later."
          action={
            <Button asChild className="h-10 px-5">
              <Link href="/books">Browse all books</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mt-10">
      {failed ? (
        <div
          role="status"
          className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-gold/60 bg-[#f6ecd5] px-4 py-3 text-sm text-ink"
        >
          <span>We couldn&apos;t check current prices and stock.</span>
          <Button type="button" variant="outline" className="h-9" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : null}

      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
        {items.map((book) => {
          const live = statuses?.get(book.bookId);
          const verified = statuses !== null;
          const unavailable = verified && (!live || live.available <= 0);
          const pricePaise = live?.pricePaise ?? book.pricePaise;
          const availability = live
            ? getAvailability({ quantity: live.available, reservedQuantity: 0 })
            : null;

          function handleAdd() {
            if (!live) return;
            const result = addItem(
              {
                ...book,
                pricePaise: live.pricePaise,
                compareAtPaise: live.compareAtPaise,
              },
              1,
              live.available,
            );
            toast(describeAddResult(result, book.title, 1));
          }

          function handleRemove() {
            remove(book.bookId);
            toast({ title: "Removed from wishlist", description: book.title });
          }

          return (
            <li key={book.bookId} className="flex flex-col">
              <Link href={`/books/${book.slug}`} className="group block rounded-lg">
                <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-secondary/70 p-6 ring-1 ring-border transition-shadow duration-300 group-hover:shadow-md">
                  <div className="w-[66%] transition-transform duration-300 group-hover:-translate-y-1.5">
                    <BookCover
                      title={book.title}
                      author={book.author}
                      coverImage={book.coverImage}
                      decorative
                    />
                  </div>
                </div>
                <h2 className="mt-4 font-heading text-lg font-semibold leading-snug text-ink group-hover:text-forest">
                  {book.title}
                </h2>
              </Link>
              {book.author ? (
                <p className="text-sm text-muted-foreground">{book.author}</p>
              ) : null}

              <p className="mt-1 font-semibold text-forest">
                {unavailable ? "—" : formatPrice(pricePaise)}
              </p>
              <p
                className={cn(
                  "text-xs font-medium",
                  unavailable ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {unavailable
                  ? "No longer available"
                  : (availability?.label ?? (loading ? "Checking stock…" : ""))}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleAdd}
                  disabled={!live || unavailable}
                  className="h-10 flex-1 rounded-md"
                >
                  Add to cart
                </Button>
                <button
                  type="button"
                  onClick={handleRemove}
                  aria-label={`Remove ${book.title} from wishlist`}
                  className="inline-flex size-10 items-center justify-center rounded-md border border-input bg-white text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-10 text-xs text-muted-foreground">
        Prototype: your wishlist is saved in this browser only for now.
      </p>
    </div>
  );
}