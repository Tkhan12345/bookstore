import { CategorySection } from "@/components/home/category-section";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { FeaturedBooks } from "@/components/home/featured-books";
import { HeroSection } from "@/components/home/hero-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { WhyUsSection } from "@/components/home/why-us-section";
import {
  getCategories,
  getFeaturedBooks,
  getNewArrivals,
} from "@/features/catalog/catalog.service";

export default async function HomePage() {
  const [featured, newest, categories] = await Promise.all([
    getFeaturedBooks(4),
    getNewArrivals(8),
    getCategories(),
  ]);

  const featuredIds = new Set(featured.map((book) => book.id));
  const newArrivals = newest.filter((book) => !featuredIds.has(book.id)).slice(0, 4);
  const heroBooks = (featured.length > 0 ? featured : newest).slice(0, 3);

  const byCount = [...categories].sort((a, b) => b.bookCount - a.bookCount);

  return (
    <>
      <HeroSection books={heroBooks} />
      <div className="mt-16 space-y-20 sm:mt-24 sm:space-y-28">
        <FeaturedBooks
          id="featured"
          eyebrow="Featured"
          title="Hand-picked for you"
          books={featured}
        />
        <CategorySection categories={byCount} />
        <FeaturedBooks
          id="new-arrivals"
          eyebrow="New arrivals"
          title="Just on the shelf"
          books={newArrivals}
        />
        <EditorialBanner category={byCount[0] ?? null} />
        <WhyUsSection />
        <NewsletterSection />
      </div>
    </>
  );
}