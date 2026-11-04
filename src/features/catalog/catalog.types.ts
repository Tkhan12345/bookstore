import type { Prisma } from "@prisma/client";

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  bookCount: number;
};

/** A book with the relations the storefront cards need. */
export type CatalogBook = Prisma.BookGetPayload<{
  include: { authors: true; categories: true; inventory: true };
}>;

export type CatalogResult = {
  books: CatalogBook[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type BookReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  authorName: string;
};

export type BookReviewSummary = {
  reviews: BookReview[];
  count: number;
  /** null when there are no reviews */
  average: number | null;
};

/** Current price and stock for a book, used to re-check carts and wishlists. */
export type BookLiveStatus = {
  bookId: string;
  pricePaise: number;
  compareAtPaise: number | null;
  /** Units available (quantity minus reserved), never negative. */
  available: number;
};