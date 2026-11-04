import type { CatalogBook } from "@/features/catalog/catalog.types";
import type { BookSnapshot } from "@/lib/validations/cart";

export function toBookSnapshot(book: CatalogBook): BookSnapshot {
  return {
    bookId: book.id,
    slug: book.slug,
    title: book.title,
    author: book.authors.map((author) => author.name).join(", "),
    pricePaise: book.pricePaise,
    compareAtPaise: book.compareAtPaise,
    coverImage: book.coverImage,
  };
}