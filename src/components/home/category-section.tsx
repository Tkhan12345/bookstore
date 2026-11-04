import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import type { NavCategory } from "@/features/catalog/catalog.types";

type CategorySectionProps = {
  categories: NavCategory[];
};

export function CategorySection({ categories }: CategorySectionProps) {
  if (categories.length === 0) return null;

  return (
    <section
      id="genres"
      aria-labelledby="genres-heading"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 sm:px-6 lg:px-8"
    >
      <SectionHeading
        headingId="genres-heading"
        eyebrow="Browse by genre"
        title="Find your shelf"
        description="Start with a genre and follow the thread."
      />
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.slice(0, 8).map((category) => (
          <li key={category.id}>
            <Link
              href={`/books?category=${category.slug}`}
              className="group flex h-full min-h-32 flex-col justify-between rounded-lg bg-secondary p-5 ring-1 ring-border transition-colors duration-300 hover:bg-forest hover:text-cream"
            >
              <span className="font-heading text-2xl font-semibold leading-tight text-forest transition-colors group-hover:text-cream">
                {category.name}
              </span>
              <span className="mt-6 flex items-center justify-between text-sm text-forest/80 transition-colors group-hover:text-sage">
                {category.bookCount} {category.bookCount === 1 ? "book" : "books"}
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-gold transition-all duration-300 group-hover:w-12"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}