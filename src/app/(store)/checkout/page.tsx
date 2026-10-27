import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Breadcrumb
        items={[
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <SectionHeading
        as="h1"
        eyebrow="Checkout"
        title="Almost there"
        className="mt-6"
      />
      <CheckoutView />
    </div>
  );
}