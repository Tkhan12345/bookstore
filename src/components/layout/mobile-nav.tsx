"use client";

import { useState } from "react";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { Menu, X } from "lucide-react";
import { SearchBar } from "@/components/layout/search-bar";
import type { NavCategory } from "@/features/catalog/catalog.types";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { SITE_NAME } from "@/lib/site-config";

type MobileNavProps = {
  categories: NavCategory[];
};

const linkClass =
  "block rounded-sm py-2 text-base font-medium text-ink transition-colors hover:text-forest";

export function MobileNav({ categories }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex size-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-muted lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(85vw,22rem)] flex-col gap-6 overflow-y-auto bg-background p-6 shadow-xl duration-300 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-heading text-2xl font-semibold text-forest">
              {SITE_NAME}
              <span className="text-gold" aria-hidden="true">.</span>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex size-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-muted"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="sr-only">
            Site navigation and search
          </Dialog.Description>

          <SearchBar id="mobile-search" />

          <nav aria-label="Mobile primary">
            <ul className="divide-y divide-border">
              <li>
                <Link href="/books" onClick={close} className={linkClass}>
                  All books
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/books?category=${category.slug}`}
                    onClick={close}
                    className={linkClass}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Mobile account" className="mt-auto border-t border-border pt-4">
            <ul>
              <li>
                <Link href="/wishlist" onClick={close} className={linkClass}>
                  Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
                </Link>
              </li>
              <li>
                <Link href="/cart" onClick={close} className={linkClass}>
                  Cart{itemCount > 0 ? ` (${itemCount})` : ""}
                </Link>
              </li>
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}