import { BookCover } from "@/components/books/book-cover";
import type { ResolvedCartItem } from "@/lib/cart-live";
import { formatPrice } from "@/lib/format";

type OrderSummaryProps = {
  entries: ResolvedCartItem[];
  itemCount: number;
  subtotalPaise: number;
  verifying: boolean;
};

export function OrderSummary({
  entries,
  itemCount,
  subtotalPaise,
  verifying,
}: OrderSummaryProps) {
  return (
    <aside
      aria-labelledby="order-summary-heading"
      className="h-fit rounded-lg bg-white p-6 ring-1 ring-border lg:sticky lg:top-24"
    >
      <h2
        id="order-summary-heading"
        className="font-heading text-2xl font-semibold text-forest"
      >
        Order summary
      </h2>

      <ul className="mt-6 divide-y divide-border">
        {entries.map(({ item, quantity, pricePaise }) => (
          <li key={item.bookId} className="flex gap-4 py-4 first:pt-0">
            <div className="w-12 shrink-0">
              <BookCover
                title={item.title}
                author={item.author}
                coverImage={item.coverImage}
                sizes="48px"
                decorative
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-base font-semibold leading-snug text-ink">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground">Qty {quantity}</p>
            </div>
            <p className="shrink-0 text-sm font-medium text-ink">
              {formatPrice(pricePaise * quantity)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="mt-2 space-y-3 border-t border-border pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </dt>
          <dd className="font-medium text-ink">{formatPrice(subtotalPaise)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="text-right text-ink">Calculated later</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-border pt-4 text-base">
          <dt className="font-semibold text-ink">Estimated total</dt>
          <dd className="font-semibold text-forest">
            {formatPrice(subtotalPaise)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 rounded-md bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <p className="font-medium text-ink">Delivery</p>
        <p className="mt-1">
          Delivery time and shipping cost will be shown here once shipping is
          set up.
        </p>
      </div>

      {verifying ? (
        <p role="status" className="mt-4 text-xs text-muted-foreground">
          Checking current prices and stock…
        </p>
      ) : null}
    </aside>
  );
}