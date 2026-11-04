"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";

const DEBOUNCE_MS = 300;

export function CatalogSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q")?.trim() ?? "";
  const [value, setValue] = useState(urlQuery);
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);

  // If the URL query is cleared elsewhere (e.g. "Clear all filters"),
  // clear the box too. Typing never triggers this because we only react to
  // a cleared URL while the box still has text.
  if (urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    if (urlQuery === "" && value !== "") setValue("");
  }

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === urlQuery) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      params.delete("page");

      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, urlQuery, searchParams, pathname, router]);

  return (
    <div
      role="search"
      className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-white px-3 transition-shadow focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/25"
    >
      <label htmlFor="catalog-search" className="sr-only">
        Search by title, author or ISBN
      </label>
      {isPending ? (
        <Loader2
          className="size-4 shrink-0 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      ) : (
        <Search
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
      <input
        id="catalog-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search title, author or ISBN"
        autoComplete="off"
        className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}