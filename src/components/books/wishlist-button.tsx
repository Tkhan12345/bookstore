"use client";

import { Heart } from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";
import type { BookSnapshot } from "@/lib/validations/cart";

type WishlistButtonProps = {
  book: BookSnapshot;
  /** `overlay`: round icon button for cards. `inline`: labelled button. */
  variant?: "overlay" | "inline";
  className?: string;
};

export function WishlistButton({
  book,
  variant = "overlay",
  className,
}: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const { toast } = useToast();
  const saved = has(book.bookId);

  function handleClick() {
    const nowSaved = toggle(book);
    toast({
      title: nowSaved ? "Saved to wishlist" : "Removed from wishlist",
      description: book.title,
      action: nowSaved
        ? { label: "View wishlist", href: "/wishlist" }
        : undefined,
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={`Save ${book.title} to wishlist`}
      className={cn(
        variant === "overlay"
          ? "inline-flex size-10 items-center justify-center rounded-full bg-white/90 text-forest ring-1 ring-border transition-colors hover:bg-white"
          : "inline-flex h-12 items-center justify-center gap-2 rounded-md border border-input bg-white px-5 text-sm font-medium text-forest transition-colors hover:bg-muted",
        className,
      )}
    >
      <Heart
        className={cn("size-5", saved && "fill-forest")}
        aria-hidden="true"
      />
      {variant === "inline" ? (
        <span aria-hidden="true">{saved ? "Saved" : "Save for later"}</span>
      ) : null}
    </button>
  );
}