import Link from "next/link";
import { AlertTriangle, Minus, Plus, Trash2 } from "lucide-react";
import { BookCover } from "@/components/books/book-cover";
import type { ResolvedCartItem } from "@/lib/cart-live";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type CartItemRowProps = {
  resolved: ResolvedCartItem;
  onQuantityChange: (bookId: string, quantity: number) => void;
  onRemove: (bookId: string, title: string) => void;
};

const stepClass =
  "inline-flex size-9 items-center justify-center text-ink transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40";

export function CartItemRow({
  resolved,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const { item, state, quantity, maxQuantity, pricePaise } = resolved;
  const unavailable = state === "unavailable";
  const href = `/books/${item.slug}`;

  return (
    <article
      aria-label={item.title}
      className={cn(
        "grid grid-cols-[5rem_1fr] gap-4 py-6 sm:grid-cols-[6rem_1fr] sm:gap-6",
        unavailable && "opacity-80",
      )}
    >
      <Link href={href} className="block self-start rounded-sm">
        <BookCover
          title={item.title}
          author={item.author}
          coverImage={item.coverImage}
          sizes="96px"
          decorative
        />
      </Link>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-semibold leading-snug text-ink">
              <Link href={href} className="hover:text-forest hover:underline">
                {item.title}
              </Link>
            </h2>
            {item.author ? (
              <p className="text-sm text-muted-foreground">{item.author}</p>
            ) : null}
          </div>
          <p className="shrink-0 text-right font-semibold text-forest">
            {unavailable ? "—" : formatPrice(pricePaise * quantity)}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          {formatPrice(pricePaise)} each
        </p>

        {unavailable ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertTriangle className="size-4" aria-hidden="true" />
            No longer available. Remove it to continue.
          </p>
        ) : (
          <>
            {resolved.priceChanged ? (
              <p className="flex items-center gap-1.5 text-sm text-[#7a5516]">
                <AlertTriangle className="size-4" aria-hidden="true" />
                Price changed from {formatPrice(item.pricePaise)}.
              </p>
            ) : null}
            {resolved.quantityReduced ? (
              <p className="flex items-center gap-1.5 text-sm text-[#7a5516]">
                <AlertTriangle className="size-4" aria-hidden="true" />
                Only {maxQuantity} in stock, so the quantity was lowered.
              </p>
            ) : null}
          </>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-4">
          {unavailable ? null : (
            <div
              role="group"
              aria-label={`Quantity for ${item.title}`}
              className="inline-flex items-center overflow-hidden rounded-md border border-input bg-white"
            >
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.title}`}
                disabled={quantity <= 1}
                onClick={() => onQuantityChange(item.bookId, quantity - 1)}
                className={stepClass}
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>
              <output
                aria-live="polite"
                className="w-10 text-center text-sm font-semibold tabular-nums text-ink"
              >
                {quantity}
              </output>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.title}`}
                disabled={quantity >= maxQuantity}
                onClick={() => onQuantityChange(item.bookId, quantity + 1)}
                className={stepClass}
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => onRemove(item.bookId, item.title)}
            aria-label={`Remove ${item.title} from cart`}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}