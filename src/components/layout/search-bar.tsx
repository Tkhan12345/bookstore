import Form from "next/form";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  id?: string;
  className?: string;
};

/**
 * GET form to /books?q=...
 * Note: /books does not read `q` yet. Catalog filtering lands in Phase C.
 */
export function SearchBar({ id = "site-search", className }: SearchBarProps) {
  return (
    <Form
      action="/books"
      role="search"
      className={cn(
        "flex h-10 items-center gap-2 rounded-md border border-input bg-white px-3 transition-shadow focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/25",
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        Search books
      </label>
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Search titles or authors"
        autoComplete="off"
        className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
      />
    </Form>
  );
}