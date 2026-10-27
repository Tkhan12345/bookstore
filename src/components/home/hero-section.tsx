import Link from "next/link";
import { BookCover } from "@/components/books/book-cover";
import { Button } from "@/components/ui/button";
import type { CatalogBook } from "@/features/catalog/catalog.types";

type HeroSectionProps = {
  books: CatalogBook[];
};

const STACK = [
  { x: 0, y: 0, rotate: 0, z: 30 },
  { x: -84, y: 20, rotate: -8, z: 20 },
  { x: 84, y: 20, rotate: 8, z: 10 },
] as const;

export function HeroSection({ books }: HeroSectionProps) {
  const stack = books.slice(0, STACK.length);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <div>
          <p className="animate-rise text-xs font-semibold uppercase tracking-[0.25em] text-forest/70">
            An independent-minded bookshop
          </p>
          <h1
            className="animate-rise mt-4 font-heading text-5xl font-semibold leading-[1.05] text-forest sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            Your next great read, chosen with care.
          </h1>
          <p
            className="animate-rise mt-6 max-w-lg text-lg leading-relaxed text-ink/75"
            style={{ animationDelay: "160ms" }}
          >
            Physical books for every mood and moment. Browse the shelf, find
            something worth keeping, and have it delivered to your door.
          </p>
          <div
            className="animate-rise mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Button asChild className="h-12 rounded-md px-7 text-base">
              <Link href="/books">Browse the shelf</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-md px-7 text-base"
            >
              <Link href="#genres">Browse by genre</Link>
            </Button>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="animate-rise relative mx-auto h-[24rem] w-full max-w-md sm:h-[28rem]"
          style={{ animationDelay: "200ms" }}
        >
          {stack.length > 0 ? (
            stack.map((book, index) => {
              const pos = STACK[index];
              return (
                <div
                  key={book.id}
                  className="absolute left-1/2 top-1/2 w-40 sm:w-48"
                  style={{
                    zIndex: pos.z,
                    transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotate}deg)`,
                  }}
                >
                  <BookCover
                    title={book.title}
                    author={book.authors.map((a) => a.name).join(", ")}
                    coverImage={book.coverImage}
                    sizes="200px"
                    priority={index === 0}
                    decorative
                  />
                </div>
              );
            })
          ) : (
            <div className="absolute left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 sm:w-52">
              <BookCover title="BookStore" decorative />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}