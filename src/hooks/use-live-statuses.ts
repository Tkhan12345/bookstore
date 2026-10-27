"use client";

import { useEffect, useState } from "react";
import { fetchBookLiveStatuses } from "@/features/catalog/catalog.actions";
import type { BookLiveStatus } from "@/features/catalog/catalog.types";

type Result = {
  key: string;
  attempt: number;
  statuses: Map<string, BookLiveStatus> | null;
};

/**
 * Verifies current price and stock for a list of book ids.
 * `statuses` is null while loading or after a failure.
 */
export function useLiveStatuses(ids: string[]) {
  const key = [...ids].sort().join(",");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    fetchBookLiveStatuses(key.split(","))
      .then((list) => {
        if (cancelled) return;
        setResult({
          key,
          attempt,
          statuses: new Map(list.map((status) => [status.bookId, status])),
        });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, attempt, statuses: null });
      });

    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  const current =
    result && result.key === key && result.attempt === attempt ? result : null;

  return {
    statuses: current?.statuses ?? null,
    loading: key !== "" && current === null,
    failed: current !== null && current.statuses === null,
    retry: () => setAttempt((value) => value + 1),
  };
}