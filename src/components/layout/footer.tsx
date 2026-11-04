import Link from "next/link";
import type { NavCategory } from "@/features/catalog/catalog.types";
import { SITE_NAME } from "@/lib/site-config";

type FooterProps = {
  categories: NavCategory[];
};

const linkClass =
  "text-sm text-cream/75 transition-colors hover:text-cream focus-visible:outline-cream";

export function Footer({ categories }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:grid-cols-4 lg:px-8">
        <div className="md:col-span-3 lg:col-span-2">
          <p className="font-heading text-3xl font-semibold">
            {SITE_NAME}
            <span className="text-gold" aria-hidden="true">.</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/75">
            An independent-minded bookshop for physical books. Browse the shelf,
            find something worth reading, and keep it.
          </p>
        </div>

        <nav aria-label="Shop">
          <h2 className="font-heading text-lg text-cream">Shop</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/books" className={linkClass}>
                All books
              </Link>
            </li>
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/books?category=${category.slug}`}
                  className={linkClass}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Your account">
          <h2 className="font-heading text-lg text-cream">Your account</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/cart" className={linkClass}>
                Cart
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className={linkClass}>
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/orders" className={linkClass}>
                Orders
              </Link>
            </li>
            <li>
              <Link href="/account" className={linkClass}>
                Account
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-cream/15">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-cream/60 sm:px-6 lg:px-8">
          © {year} {SITE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
