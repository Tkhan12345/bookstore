import type { BookLiveStatus } from "@/features/catalog/catalog.types";
import { MAX_QUANTITY_PER_ORDER } from "@/lib/site-config";
import type { CartItem } from "@/lib/validations/cart";

export type ResolvedCartItem = {
  item: CartItem;
  /** Live price when verified, otherwise the saved price. */
  pricePaise: number;
  compareAtPaise: number | null;
  /** Quantity after clamping to live stock. */
  quantity: number;
  maxQuantity: number;
  state: "unverified" | "ok" | "unavailable";
  priceChanged: boolean;
  quantityReduced: boolean;
};

export function resolveCartItem(
  item: CartItem,
  statuses: Map<string, BookLiveStatus> | null,
): ResolvedCartItem {
  const saved = {
    item,
    pricePaise: item.pricePaise,
    compareAtPaise: item.compareAtPaise,
    quantity: item.quantity,
    maxQuantity: item.maxQuantity,
    priceChanged: false,
    quantityReduced: false,
  };

  if (!statuses) return { ...saved, state: "unverified" };

  const live = statuses.get(item.bookId);
  if (!live || live.available <= 0) return { ...saved, state: "unavailable" };

  const maxQuantity = Math.min(live.available, MAX_QUANTITY_PER_ORDER);
  const quantity = Math.min(item.quantity, maxQuantity);

  return {
    item,
    pricePaise: live.pricePaise,
    compareAtPaise: live.compareAtPaise,
    quantity,
    maxQuantity,
    state: "ok",
    priceChanged: live.pricePaise !== item.pricePaise,
    quantityReduced: quantity < item.quantity,
  };
}

export function summarizeCart(resolved: ResolvedCartItem[]) {
  const purchasable = resolved.filter((entry) => entry.state !== "unavailable");

  return {
    subtotalPaise: purchasable.reduce(
      (sum, entry) => sum + entry.pricePaise * entry.quantity,
      0,
    ),
    itemCount: purchasable.reduce((sum, entry) => sum + entry.quantity, 0),
    unavailableCount: resolved.length - purchasable.length,
    needsSync: resolved.some(
      (entry) =>
        entry.state === "ok" &&
        (entry.priceChanged ||
          entry.quantityReduced ||
          entry.maxQuantity !== entry.item.maxQuantity),
    ),
  };
}