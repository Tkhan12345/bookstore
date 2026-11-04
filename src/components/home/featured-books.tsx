import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookCard, bookToCardProps } from "@/components/books/book-card";
import { SectionHeading } from "@/components/shared/section-heading";
import type { CatalogBook } from "@/features/catalog/catalog.types";

type FeaturedBooksProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  books: CatalogBook[];
};

export function FeaturedBooks({
  id,
  eyebrow,
  title,
  description,
  books,
}: FeaturedBooksProps) {
  if (books.length === 0) return null;

  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
            <SectionHeading
        headingId={headingId}
        title={title}
        eyebrow={eyebrow}
        description={description}
        action={
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest underline-offset-4 hover:underline"
          >
            View all books
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
        {books.map((book) => (
          <li key={book.id}>
            <BookCard {...bookToCardProps(book)} />
          </li>
        ))}
      </ul>
    </section>
  );
}