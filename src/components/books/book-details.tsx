import Link from "next/link";
import { BookCover } from "@/components/books/book-cover";
import { PurchasePanel } from "@/components/books/purchase-panel";
import type { CatalogBook } from "@/features/catalog/catalog.types";
import { toBookSnapshot } from "@/lib/book-snapshot";
import {
  formatPrice,
  getAvailability,
  getDiscountPercent,
} from "@/lib/format";
import { cn } from "@/lib/utils";

const statusTone = {
  "in-stock": "bg-secondary text-forest",
  "low-stock": "bg-[#f3e6c9] text-[#6b4810]",
  "out-of-stock": "bg-muted text-muted-foreground",
} as const;

function formatPublished(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function BookDetails({ book }: { book: CatalogBook }) {
  const authors = book.authors.map((author) => author.name).join(", ");
  const availability = getAvailability(book.inventory);
  const discount = getDiscountPercent(book.pricePaise, book.compareAtPaise);

  const details: { label: string; value: string }[] = [
    book.isbn ? { label: "ISBN", value: book.isbn } : null,
    book.publisher ? { label: "Publisher", value: book.publisher } : null,
    book.publishedAt
      ? { label: "Published", value: formatPublished(book.publishedAt) }
      : null,
    book.pageCount ? { label: "Pages", value: String(book.pageCount) } : null,
    book.language ? { label: "Language", value: book.language } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  const paragraphs = book.description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="flex items-center justify-center rounded-lg bg-secondary/70 px-6 py-12 ring-1 ring-border sm:py-16">
        <div className="w-3/5 max-w-xs">
          <BookCover
            title={book.title}
            author={authors}
            coverImage={book.coverImage}
            sizes="(min-width: 1024px) 24vw, 60vw"
            priority
          />
        </div>
      </div>

      <div>
        {book.categories.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Genres">
            {book.categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/books?category=${category.slug}`}
                  className="inline-block rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-forest transition-colors hover:bg-forest hover:text-cream"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <h1 className="mt-4 font-heading text-4xl font-semibold leading-tight text-forest sm:text-5xl">
          {book.title}
        </h1>
        {authors ? (
          <p className="mt-3 text-lg text-ink/75">By {authors}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-3xl font-semibold text-forest">
            {formatPrice(book.pricePaise)}
          </p>
          {discount !== null && book.compareAtPaise ? (
            <>
              <s className="text-lg text-muted-foreground">
                <span className="sr-only">Original price </span>
                {formatPrice(book.compareAtPaise)}
              </s>
              <span className="text-sm font-medium text-forest">
                {discount}% off
              </span>
            </>
          ) : null}
        </div>

        <p
          className={cn(
            "mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold",
            statusTone[availability.status],
          )}
        >
          {availability.label}
        </p>

        <div className="mt-8 border-t border-border pt-8">
                    <PurchasePanel
            book={toBookSnapshot(book)}
            available={availability.available}
          />
        </div>

        <section aria-labelledby="about-heading" className="mt-10">
          <h2
            id="about-heading"
            className="font-heading text-2xl font-semibold text-forest"
          >
            About this book
          </h2>
          <div className="mt-3 space-y-4 leading-relaxed text-ink/80">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>

        {details.length > 0 ? (
          <section aria-labelledby="details-heading" className="mt-10">
            <h2
              id="details-heading"
              className="font-heading text-2xl font-semibold text-forest"
            >
              Details
            </h2>
            <dl className="mt-3 divide-y divide-border border-y border-border">
              {details.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-3 gap-4 py-3 text-sm"
                >
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="col-span-2 font-medium text-ink">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>
    </div>
  );
}