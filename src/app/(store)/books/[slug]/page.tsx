import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookDetails } from "@/components/books/book-details";
import { ReviewsSection } from "@/components/books/reviews-section";
import { FeaturedBooks } from "@/components/home/featured-books";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import {
  getBookDetail,
  getBookReviews,
  getRelatedBooks,
} from "@/features/catalog/catalog.service";

type BookPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookDetail(slug);
  if (!book) return { title: "Book not found" };

  const authors = book.authors.map((author) => author.name).join(", ");
  return {
    title: authors ? `${book.title} by ${authors}` : book.title,
    description: book.description.slice(0, 160),
  };
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const { slug } = await params;
  const book = await getBookDetail(slug);

  if (!book) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedBooks(
      book.id,
      book.categories.map((category) => category.id),
      4,
    ),
    getBookReviews(book.id),
  ]);

  const primaryCategory = book.categories[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Books", href: "/books" },
          ...(primaryCategory
            ? [
                {
                  label: primaryCategory.name,
                  href: `/books?category=${primaryCategory.slug}`,
                },
              ]
            : []),
          { label: book.title },
        ]}
      />

      <div className="mt-8">
        <BookDetails book={book} />
      </div>

      <div className="mt-20 sm:mt-24">
        <ReviewsSection summary={reviews} />
      </div>

      <div className="-mx-4 mt-20 sm:-mx-6 sm:mt-24 lg:-mx-8">
        <FeaturedBooks
          id="related"
          eyebrow="Keep reading"
          title="You may also like"
          books={related}
        />
      </div>
    </div>
  );
}