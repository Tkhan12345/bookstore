
import { BookCard } from "@/components/books/book-card";
import { getBooks } from "@/features/catalog/catalog.service";

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-editorial text-4xl">
        Explore Our Collection
      </h1>

      <p className="mt-3 text-gray-600">
        Find a book for every mood and moment.
      </p>

      {books.length === 0 ? (
        <p className="mt-10">No books available yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              title={book.title}
              slug={book.slug}
              author={
                book.authors.map((a) => a.name).join(", ") ||
                "Unknown author"
              }
              pricePaise={book.pricePaise}
            />
          ))}
        </div>
      )}
    </section>
  );
}
