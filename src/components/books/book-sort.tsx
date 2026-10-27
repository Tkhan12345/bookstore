"use client";

import { useOptimistic, useTransition, type ChangeEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_SORT,
  SORT_LABELS,
  SORT_OPTIONS,
  type SortOption,
} from "@/lib/validations/catalog-query";

export function BookSort({ value }: { value: SortOption }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(value);

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as SortOption;
    const params = new URLSearchParams(searchParams.toString());

    if (next === DEFAULT_SORT) params.delete("sort");
    else params.set("sort", next);
    params.delete("page");

    const qs = params.toString();
    startTransition(() => {
      setOptimistic(next);
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="catalog-sort" className="text-sm text-muted-foreground">
        Sort by
      </label>
      <select
        id="catalog-sort"
        value={optimistic}
        onChange={handleChange}
        className="h-10 rounded-md border border-input bg-white px-3 text-sm text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/25"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_LABELS[option]}
          </option>
        ))}
      </select>
    </div>
  );
}