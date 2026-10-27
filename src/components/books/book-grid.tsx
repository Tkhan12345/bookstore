import { BookCard, bookToCardProps } from "@/components/books/book-card";
import type { CatalogBook } from "@/features/catalog/catalog.types";

export function BookGrid({ books }: { books: CatalogBook[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <li key={book.id}>
          <BookCard {...bookToCardProps(book)} />
        </li>
      ))}
    </ul>
  );
}