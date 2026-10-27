import type { z } from "zod";

/**
 * A tiny localStorage-backed store shaped for `useSyncExternalStore`.
 * - Server and hydration render use `empty`, so there are no hydration errors.
 * - Stored JSON is validated; anything invalid falls back to `empty`.
 * - Other tabs are picked up through the `storage` event.
 * - If storage is unavailable (private mode, quota), state stays in memory.
 */
export function createPersistentStore<T>(
  key: string,
  schema: z.ZodType<T>,
  empty: T,
) {
  let cache: T = empty;
  let lastRaw: string | null | undefined;
  let memoryOnly = false;
  const listeners = new Set<() => void>();

  function getSnapshot(): T {
    if (typeof window === "undefined" || memoryOnly) return cache;

    let stored: string | null;
    try {
      stored = window.localStorage.getItem(key);
    } catch {
      memoryOnly = true;
      return cache;
    }

    if (stored === lastRaw) return cache;
    lastRaw = stored;

    if (stored === null) {
      cache = empty;
      return cache;
    }

    try {
      const parsed = schema.safeParse(JSON.parse(stored));
      cache = parsed.success ? parsed.data : empty;
    } catch {
      cache = empty;
    }
    return cache;
  }

  function getServerSnapshot(): T {
    return empty;
  }

  function set(next: T): void {
    cache = next;
    try {
      const serialized = JSON.stringify(next);
      lastRaw = serialized;
      window.localStorage.setItem(key, serialized);
    } catch {
      memoryOnly = true;
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { getSnapshot, getServerSnapshot, set, subscribe };
}