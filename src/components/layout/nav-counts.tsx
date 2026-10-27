"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

const iconLinkClass =
  "relative inline-flex size-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-muted hover:text-forest";

function Badge({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-forest px-1 text-[10px] font-semibold leading-none text-cream"
    >
      {value > 99 ? "99+" : value}
    </span>
  );
}

export function NavCounts() {
  const { itemCount } = useCart();
  const { count } = useWishlist();

  return (
    <>
      <Link
        href="/wishlist"
        aria-label={`Wishlist, ${count} ${count === 1 ? "book" : "books"}`}
        className={iconLinkClass}
      >
        <Heart className="size-5" aria-hidden="true" />
        <Badge value={count} />
      </Link>
      <Link
        href="/cart"
        aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        className={iconLinkClass}
      >
        <ShoppingBag className="size-5" aria-hidden="true" />
        <Badge value={itemCount} />
      </Link>
    </>
  );
}