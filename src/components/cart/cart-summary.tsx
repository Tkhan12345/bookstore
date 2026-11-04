import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/site-config";

type CartSummaryProps = {
  itemCount: number;
  subtotalPaise: number;
  verifying: boolean;
  hasUnavailable: boolean;
};

export function CartSummary({
  itemCount,
  subtotalPaise,
  verifying,
  hasUnavailable,
}: CartSummaryProps) {
  const threshold = FREE_SHIPPING_THRESHOLD_PAISE;

  return (
    <aside
      aria-labelledby="summary-heading"
      className="h-fit rounded-lg bg-white p-6 ring-1 ring-border lg:sticky lg:top-24"
    >
      <h2
        id="summary-heading"
        className="font-heading text-2xl font-semibold text-forest"
      >
        Order summary
      </h2>

      <dl className="mt-6 space-y-3 text-sm">
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

      {threshold !== null ? (
        <p className="mt-4 text-xs text-muted-foreground">
          {subtotalPaise >= threshold
            ? "You qualify for free shipping."
            : `Add ${formatPrice(threshold - subtotalPaise)} more for free shipping.`}
        </p>
      ) : null}

      {hasUnavailable ? (
        <Button
          type="button"
          disabled
          className="mt-6 h-12 w-full rounded-md text-base"
        >
          Proceed to checkout
        </Button>
      ) : (
        <Button asChild className="mt-6 h-12 w-full rounded-md text-base">
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>
      )}

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {hasUnavailable
          ? "Remove unavailable items to continue. "
          : verifying
            ? "Checking current prices and stock… "
            : ""}
        Ordering isn&apos;t available yet, so checkout is a preview. Your cart
        is saved in this browser only for now.
      </p>
    </aside>
  );
}