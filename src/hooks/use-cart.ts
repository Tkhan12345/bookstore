"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { BookLiveStatus } from "@/features/catalog/catalog.types";
import { createPersistentStore } from "@/lib/persistent-store";
import { MAX_QUANTITY_PER_ORDER } from "@/lib/site-config";
import {
  cartSchema,
  type BookSnapshot,
  type CartItem,
} from "@/lib/validations/cart";

const EMPTY: CartItem[] = [];

/**
 * FRONTEND-ONLY PROTOTYPE: the cart lives in this browser's localStorage.
 * It is not persisted to the database and prices may go stale.
 */
const store = createPersistentStore("bookstore.cart.v1", cartSchema, EMPTY);

export type AddToCartResult = {
  status: "added" | "capped" | "at-limit" | "unavailable";
  /** Quantity of this book in the cart after the call. */
  quantity: number;
};

export function useCart() {
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const addItem = useCallback(
    (book: BookSnapshot, quantity: number, available: number): AddToCartResult => {
      const cap = Math.min(available, MAX_QUANTITY_PER_ORDER);
      const current = store.getSnapshot();
      const existing = current.find((item) => item.bookId === book.bookId);
      const currentQty = existing?.quantity ?? 0;

      if (cap <= 0) return { status: "unavailable", quantity: currentQty };

      const wanted = currentQty + Math.max(1, quantity);
      const nextQty = Math.min(cap, wanted);
      if (nextQty <= currentQty) return { status: "at-limit", quantity: currentQty };

      const nextItem: CartItem = { ...book, quantity: nextQty, maxQuantity: cap };
      store.set(
        existing
          ? current.map((item) => (item.bookId === book.bookId ? nextItem : item))
          : [...current, nextItem],
      );

      return {
        status: nextQty < wanted ? "capped" : "added",
        quantity: nextQty,
      };
    },
    [],
  );

  const setQuantity = useCallback((bookId: string, quantity: number) => {
    store.set(
      store.getSnapshot().map((item) =>
        item.bookId === bookId
          ? { ...item, quantity: Math.min(item.maxQuantity, Math.max(1, quantity)) }
          : item,
      ),
    );
  }, []);

  const removeItem = useCallback((bookId: string) => {
    store.set(store.getSnapshot().filter((item) => item.bookId !== bookId));
  }, []);

  const clear = useCallback(() => store.set(EMPTY), []);

  /**
   * Saves verified price and stock into the cart. Unavailable books are left
   * untouched so the shopper can see and remove them.
   */
  const applyLiveData = useCallback(
    (statuses: Map<string, BookLiveStatus>) => {
      store.set(
        store.getSnapshot().map((item) => {
          const live = statuses.get(item.bookId);
          if (!live || live.available <= 0) return item;

          const maxQuantity = Math.min(live.available, MAX_QUANTITY_PER_ORDER);
          return {
            ...item,
            pricePaise: live.pricePaise,
            compareAtPaise: live.compareAtPaise,
            maxQuantity,
            quantity: Math.min(item.quantity, maxQuantity),
          };
        }),
      );
    },
    [],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const subtotalPaise = useMemo(
    () => items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0),
    [items],
  );

  return {
    items,
    itemCount,
    subtotalPaise,
    addItem,
    setQuantity,
    removeItem,
    clear,
    applyLiveData,
  };
}