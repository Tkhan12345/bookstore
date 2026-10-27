import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CatalogQuery, SortOption } from "@/lib/validations/catalog-query";
import { getAvailability } from "@/lib/format";
import type {
  BookLiveStatus,
  BookReviewSummary,
  CatalogBook,
  CatalogResult,
  NavCategory,
} from "./catalog.types";

/** Books per page on /books. Lower it temporarily to test pagination. */
export const CATALOG_PAGE_SIZE = 12;

const bookInclude = {
  authors: true,
  categories: true,
  inventory: true,
} satisfies Prisma.BookInclude;

export async function getBooks() {
  return prisma.book.findMany({
    where: { active: true },
    include: {
      authors: true,
      categories: true,
      inventory: true,
    },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
}

export async function getBookBySlug(slug: string) {
  return prisma.book.findUnique({
    where: { slug, active: true },
    include: {
      authors: true,
      categories: true,
      inventory: true,
    },
  });
}

/**
 * Request-scoped cached lookup, so `generateMetadata` and the page share one
 * query. `getBookBySlug` itself is unchanged.
 */
export const getBookDetail = cache(getBookBySlug);

/** Active books flagged `featured`, newest first. */
export async function getFeaturedBooks(limit = 4): Promise<CatalogBook[]> {
  return prisma.book.findMany({
    where: { active: true, featured: true },
    include: bookInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Most recently added active books. */
export async function getNewArrivals(limit = 8): Promise<CatalogBook[]> {
  return prisma.book.findMany({
    where: { active: true },
    include: bookInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Books from the same genres first, topped up with the newest other books so
 * the row is not empty in a small catalogue.
 */
export async function getRelatedBooks(
  bookId: string,
  categoryIds: string[],
  limit = 4,
): Promise<CatalogBook[]> {
  const sameGenre =
    categoryIds.length > 0
      ? await prisma.book.findMany({
          where: {
            active: true,
            id: { not: bookId },
            categories: { some: { id: { in: categoryIds } } },
          },
          include: bookInclude,
          orderBy: { createdAt: "desc" },
          take: limit,
        })
      : [];

  if (sameGenre.length >= limit) return sameGenre;

  const filler = await prisma.book.findMany({
    where: {
      active: true,
      id: { notIn: [bookId, ...sameGenre.map((book) => book.id)] },
    },
    include: bookInclude,
    orderBy: { createdAt: "desc" },
    take: limit - sameGenre.length,
  });

  return [...sameGenre, ...filler];
}

/** Real reviews only. Exposes the reviewer's name, never their email. */
export async function getBookReviews(
  bookId: string,
  limit = 10,
): Promise<BookReviewSummary> {
  const [rows, aggregate] = await Promise.all([
    prisma.review.findMany({
      where: { bookId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.review.aggregate({
      where: { bookId },
      _avg: { rating: true },
      _count: { _all: true },
    }),
  ]);

  return {
    reviews: rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.createdAt,
      authorName: row.user.name?.trim() || "Anonymous reader",
    })),
    count: aggregate._count._all,
    average: aggregate._avg.rating,
  };
}

/**
 * Categories that contain at least one active book, with active-book counts.
 * Wrapped in `cache` so the layout and a page share one query per request.
 */
export const getCategories = cache(async (): Promise<NavCategory[]> => {
  const categories = await prisma.category.findMany({
    where: { books: { some: { active: true } } },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { books: { where: { active: true } } } },
    },
    orderBy: { name: "asc" },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    bookCount: category._count.books,
  }));
});

const ORDER_BY: Record<SortOption, Prisma.BookOrderByWithRelationInput[]> = {
  newest: [{ createdAt: "desc" }, { id: "asc" }],
  "price-asc": [{ pricePaise: "asc" }, { id: "asc" }],
  "price-desc": [{ pricePaise: "desc" }, { id: "asc" }],
  "title-asc": [{ title: "asc" }, { id: "asc" }],
};

function buildWhere(query: CatalogQuery): Prisma.BookWhereInput {
  const price: { gte?: number; lte?: number } = {};
  if (query.minPrice !== undefined) price.gte = query.minPrice * 100;
  if (query.maxPrice !== undefined) price.lte = query.maxPrice * 100;

  return {
    active: true,
    ...(query.category
      ? { categories: { some: { slug: query.category } } }
      : {}),
    ...(Object.keys(price).length > 0 ? { pricePaise: price } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: "insensitive" } },
            {
              authors: {
                some: { name: { contains: query.q, mode: "insensitive" } },
              },
            },
            { isbn: { contains: query.q } },
          ],
        }
      : {}),
  };
}

/** Filtered, sorted, paginated catalogue. Page is clamped to a valid range. */
export async function getCatalogBooks(
  query: CatalogQuery,
): Promise<CatalogResult> {
  const where = buildWhere(query);
  const total = await prisma.book.count({ where });

  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const page = Math.min(query.page, totalPages);

  const books = await prisma.book.findMany({
    where,
    include: bookInclude,
    orderBy: ORDER_BY[query.sort],
    skip: (page - 1) * CATALOG_PAGE_SIZE,
    take: CATALOG_PAGE_SIZE,
  });

  return { books, total, page, pageSize: CATALOG_PAGE_SIZE, totalPages };
}

/**
 * Current price and stock for the given book ids. Inactive or unknown books
 * are simply absent from the result, which callers treat as "unavailable".
 */
export async function getBookLiveStatuses(
  ids: string[],
): Promise<BookLiveStatus[]> {
  if (ids.length === 0) return [];

  const books = await prisma.book.findMany({
    where: { active: true, id: { in: ids } },
    select: {
      id: true,
      pricePaise: true,
      compareAtPaise: true,
      inventory: { select: { quantity: true, reservedQuantity: true } },
    },
  });

  return books.map((book) => ({
    bookId: book.id,
    pricePaise: book.pricePaise,
    compareAtPaise: book.compareAtPaise,
    available: getAvailability(book.inventory).available,
  }));
}