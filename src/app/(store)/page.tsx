
import Link from "next/link";
import { BookCard } from "@/components/books/book-card";
import { getBooks } from "@/features/catalog/catalog.service";

export default async function HomePage() {
  const books = await getBooks();

  return (
    <>
      <section className="bg-[#18392B] px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-sm tracking-[0.2em] text-[#C69C55]">
            A WORLD OF STORIES
          </p>

          <h1 className="font-editorial max-w-2xl text-5xl leading-tight md:text-7xl">
            Your next great read awaits.
          </h1>

          <p className="mt-6 max-w-xl text-lg text-[#A8BBA3]">
            Explore carefully selected books and discover
            stories that stay with you.
          </p>

          <Link
            href="/books"
            className="mt-8 inline-block rounded-md
              bg-[#C69C55] px-6 py-3 font-semibold
              text-[#18392B] hover:opacity-90"
          >
            Explore Books →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-editorial text-3xl">
            Featured Books
          </h2>

          <Link
            href="/books"
            className="text-sm font-semibold text-[#18392B]"
          >
            View All →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.slice(0, 3).map((book) => (
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
      </section>
    </>
  );
}
