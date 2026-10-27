"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { WishlistButton } from "@/components/books/wishlist-button";
import { useToast } from "@/components/shared/toast-provider";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { describeAddResult } from "@/lib/cart-toast";
import { formatPrice } from "@/lib/format";
import { MAX_QUANTITY_PER_ORDER } from "@/lib/site-config";
import type { BookSnapshot } from "@/lib/validations/cart";

type PurchasePanelProps = {
  book: BookSnapshot;
  /** Units currently available (quantity minus reserved). */
  available: number;
};

export function PurchasePanel({ book, available }: PurchasePanelProps) {
  const max = Math.min(available, MAX_QUANTITY_PER_ORDER);
  const [quantity, setQuantity] = useState(1);
  const { items, addItem } = useCart();
  const { toast } = useToast();

  const inCart = items.find((item) => item.bookId === book.bookId)?.quantity ?? 0;

  function handleAdd() {
    const result = addItem(book, quantity, available);
    toast(describeAddResult(result, book.title, quantity));
  }

  if (max <= 0) {
    return (
      <div className="space-y-4">
        <p className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          This book is currently out of stock.
        </p>
        <WishlistButton book={book} variant="inline" />
      </div>
    );
  }

  const stepButtonClass =
    "inline-flex size-10 items-center justify-center text-ink transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="space-y-5">
      <div>
        <span id="quantity-label" className="text-sm font-medium text-ink">
          Quantity
        </span>
        <div className="mt-2 flex items-center gap-4">
          <div
            role="group"
            aria-labelledby="quantity-label"
            className="inline-flex items-center overflow-hidden rounded-md border border-input bg-white"
          >
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className={stepButtonClass}
            >
              <Minus className="size-4" aria-hidden="true" />
            </button>
            <output
              aria-live="polite"
              className="w-12 text-center text-sm font-semibold tabular-nums text-ink"
            >
              {quantity}
            </output>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={quantity >= max}
              onClick={() => setQuantity((q) => Math.min(max, q + 1))}
              className={stepButtonClass}
            >
              <Plus className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {quantity >= max
              ? max < available
                ? `Limit of ${MAX_QUANTITY_PER_ORDER} per order`
                : "That's all we have in stock"
              : `Total ${formatPrice(book.pricePaise * quantity)}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={handleAdd}
          className="h-12 flex-1 rounded-md text-base sm:flex-none sm:px-10"
        >
          Add to cart
        </Button>
        <WishlistButton book={book} variant="inline" />
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        {inCart > 0 ? (
          <p className="font-medium text-forest">
            {inCart} {inCart === 1 ? "copy" : "copies"} in your cart
          </p>
        ) : null}
        <p>
          Prototype: your cart and wishlist are saved in this browser only for
          now.
        </p>
      </div>
    </div>
  );
}