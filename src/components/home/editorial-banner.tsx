import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavCategory } from "@/features/catalog/catalog.types";

type EditorialBannerProps = {
  category: NavCategory | null;
};

export function EditorialBanner({ category }: EditorialBannerProps) {
  if (!category) return null;

  return (
    <section
      aria-labelledby="editorial-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div className="grid items-center gap-8 rounded-xl bg-forest px-6 py-14 text-cream sm:px-12 md:grid-cols-5 lg:px-16 lg:py-20">
        <div className="md:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            From the shelves
          </p>
          <h2
            id="editorial-heading"
            className="mt-4 font-heading text-4xl font-semibold leading-tight sm:text-5xl"
          >
            A shelf for every season of reading.
          </h2>
          <p className="mt-5 max-w-lg leading-relaxed text-sage">
            Our largest collection right now is {category.name}, with{" "}
            {category.bookCount} {category.bookCount === 1 ? "title" : "titles"}{" "}
            ready to ship. Start there, or wander.
          </p>
          <Button
            asChild
            className="mt-8 h-12 rounded-md bg-gold px-7 text-base text-ink hover:bg-gold/90"
          >
            <Link href={`/books?category=${category.slug}`}>
              Explore {category.name}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <p
          aria-hidden="true"
          className="hidden font-heading text-6xl font-semibold italic leading-none text-cream/15 md:col-span-2 md:block lg:text-7xl"
        >
          {category.name}
        </p>
      </div>
    </section>
  );
}