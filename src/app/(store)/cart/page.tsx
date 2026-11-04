import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <SectionHeading as="h1" eyebrow="Cart" title="Your cart" />
      <CartView />
    </div>
  );
}