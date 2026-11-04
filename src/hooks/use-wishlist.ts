"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { createPersistentStore } from "@/lib/persistent-store";
import { wishlistSchema, type BookSnapshot } from "@/lib/validations/cart";

const EMPTY: BookSnapshot[] = [];

/** FRONTEND-ONLY PROTOTYPE: stored in this browser's localStorage. */
const store = createPersistentStore(
  "bookstore.wishlist.v1",
  wishlistSchema,
  EMPTY,
);

export function useWishlist() {
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  const savedIds = useMemo(
    () => new Set(items.map((item) => item.bookId)),
    [items],
  );

  const has = useCallback((bookId: string) => savedIds.has(bookId), [savedIds]);

  /** Returns true if the book is now saved, false if it was removed. */
  const toggle = useCallback((book: BookSnapshot): boolean => {
    const current = store.getSnapshot();
    if (current.some((item) => item.bookId === book.bookId)) {
      store.set(current.filter((item) => item.bookId !== book.bookId));
      return false;
    }
    store.set([book, ...current]);
    return true;
  }, []);

  const remove = useCallback((bookId: string) => {
    store.set(store.getSnapshot().filter((item) => item.bookId !== bookId));
  }, []);

  return { items, count: items.length, has, toggle, remove };
}