import { UserRound } from "lucide-react";
import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavCounts } from "@/components/layout/nav-counts";
import { SearchBar } from "@/components/layout/search-bar";
import type { NavCategory } from "@/features/catalog/catalog.types";
import { NAV_CATEGORY_LIMIT, SITE_NAME } from "@/lib/site-config";

type NavbarProps = {
  categories: NavCategory[];
};

const navLinkClass =
  "relative py-1 text-sm font-medium text-ink/80 transition-colors hover:text-forest after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100";

export function Navbar({ categories }: NavbarProps) {
  const navCategories = categories.slice(0, NAV_CATEGORY_LIMIT);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-8 lg:px-8">
        <MobileNav categories={categories} />

        <Link
          href="/"
          aria-label={`${SITE_NAME} home`}
          className="font-heading text-2xl font-semibold tracking-tight text-forest"
        >
          {SITE_NAME}
          <span className="text-gold" aria-hidden="true">.</span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/books" className={navLinkClass}>
                All books
              </Link>
            </li>
            {navCategories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/books?category=${category.slug}`}
                  className={navLinkClass}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SearchBar id="desktop-search" className="mr-2 hidden w-56 md:flex lg:w-64" />
          <NavCounts />
          <Link
            href="/account"
            aria-label="My account"
            title="My account"
            className="inline-flex size-10 items-center justify-center rounded-md text-forest transition-colors hover:bg-secondary"
          >
            <UserRound className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
