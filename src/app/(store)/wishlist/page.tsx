import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = { title: "Your wishlist" };

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <SectionHeading
        as="h1"
        eyebrow="Wishlist"
        title="Saved for later"
        description="Books you've set aside to come back to."
      />
      <WishlistView />
    </div>
  );
}