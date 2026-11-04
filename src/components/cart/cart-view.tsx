"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import { CartItemRow } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/shared/toast-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { useLiveStatuses } from "@/hooks/use-live-statuses";
import { resolveCartItem, summarizeCart } from "@/lib/cart-live";

function Notice({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center gap-3 rounded-md border border-gold/60 bg-[#f6ecd5] px-4 py-3 text-sm text-ink"
    >
      {children}
    </div>
  );
}

function CartSkeleton() {
  return (
    <div
      className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12"
      role="status"
      aria-label="Loading cart"
    >
      <div className="space-y-6">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="flex gap-6">
            <Skeleton className="h-36 w-24" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function CartView() {
  const hydrated = useHydrated();
  const { items, setQuantity, removeItem, applyLiveData } = useCart();
  const { toast } = useToast();
  const { statuses, loading, failed, retry } = useLiveStatuses(
    items.map((item) => item.bookId),
  );

  if (!hydrated) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <div className="mt-10">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Find something worth reading and it will wait for you here."
          action={
            <Button asChild className="h-10 px-5">
              <Link href="/books">Browse all books</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const resolved = items.map((item) => resolveCartItem(item, statuses));
  const summary = summarizeCart(resolved);

  function handleRemove(bookId: string, title: string) {
    removeItem(bookId);
    toast({ title: "Removed from cart", description: title });
  }

  function handleSync() {
    if (!statuses) return;
    applyLiveData(statuses);
    toast({ title: "Cart updated", description: "Prices and stock are current." });
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
      <div className="min-w-0">
        {failed ? (
          <Notice>
            <span>We couldn&apos;t check current prices and stock.</span>
            <Button type="button" variant="outline" className="h-9" onClick={retry}>
              Try again
            </Button>
          </Notice>
        ) : null}

        {summary.needsSync ? (
          <Notice>
            <span>
              Some prices or stock levels have changed since you added these
              books.
            </span>
            <Button type="button" className="h-9" onClick={handleSync}>
              Update cart
            </Button>
          </Notice>
        ) : null}

        <ul className="divide-y divide-border border-y border-border">
          {resolved.map((entry) => (
            <li key={entry.item.bookId}>
              <CartItemRow
                resolved={entry}
                onQuantityChange={setQuantity}
                onRemove={handleRemove}
              />
            </li>
          ))}
        </ul>
      </div>

      <CartSummary
        itemCount={summary.itemCount}
        subtotalPaise={summary.subtotalPaise}
        verifying={loading}
        hasUnavailable={summary.unavailableCount > 0}
      />
    </div>
  );
}