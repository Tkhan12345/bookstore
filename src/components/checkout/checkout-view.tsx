"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, ShoppingBag } from "lucide-react";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentMethodSelect } from "@/components/checkout/payment-method";
import { ShippingForm, fieldId } from "@/components/checkout/shipping-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { useLiveStatuses } from "@/hooks/use-live-statuses";
import { resolveCartItem, summarizeCart } from "@/lib/cart-live";
import {
  SHIPPING_FIELDS,
  validateShipping,
  type FieldErrors,
  type PaymentMethod,
  type ShippingField,
  type ShippingValues,
} from "@/lib/validations/checkout";

const EMPTY_VALUES: ShippingValues = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
};

function CheckoutSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading checkout"
      className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12"
    >
      <div className="space-y-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

/**
 * CHECKOUT UI ONLY. Nothing here is sent anywhere: the address lives in
 * component state (not localStorage), no order is created, and no payment is
 * taken. Real ordering and Razorpay arrive in a later backend phase.
 */
export function CheckoutView() {
  const hydrated = useHydrated();
  const { items } = useCart();
  const { statuses, loading } = useLiveStatuses(items.map((item) => item.bookId));

  const [values, setValues] = useState<ShippingValues>(EMPTY_VALUES);
  const [touched, setTouched] = useState<Partial<Record<ShippingField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("razorpay");
  const [passedValidation, setPassedValidation] = useState(false);

  const errors = useMemo(() => validateShipping(values), [values]);
  const errorCount = Object.keys(errors).length;

  if (!hydrated) return <CheckoutSkeleton />;

  if (items.length === 0) {
    return (
      <div className="mt-10">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add a book to your cart before checking out."
          action={
            <Button asChild className="h-10 px-5">
              <Link href="/books">Browse all books</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const resolved = items.map((item) => resolveCartItem(item, statuses));
  const purchasable = resolved.filter((entry) => entry.state !== "unavailable");
  const summary = summarizeCart(resolved);
  const blocked = summary.unavailableCount > 0;

  const visibleErrors: FieldErrors = {};
  for (const field of SHIPPING_FIELDS) {
    if ((touched[field] || submitted) && errors[field]) {
      visibleErrors[field] = errors[field];
    }
  }

  function handleChange(field: ShippingField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setPassedValidation(false);
  }

  function handleBlur(field: ShippingField) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const firstInvalid = SHIPPING_FIELDS.find((field) => errors[field]);
    if (firstInvalid) {
      setPassedValidation(false);
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    // Deliberately no network call, no order and no success page.
    setPassedValidation(true);
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
      <form onSubmit={handleSubmit} noValidate className="min-w-0 space-y-10">
        {blocked ? (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 bg-white px-4 py-3 text-sm text-ink"
          >
            <AlertTriangle
              className="size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <span>Some books in your cart are no longer available.</span>
            <Button asChild variant="outline" className="h-9">
              <Link href="/cart">Review cart</Link>
            </Button>
          </div>
        ) : null}

        {submitted && errorCount > 0 ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-white px-4 py-3 text-sm text-destructive"
          >
            Please fix {errorCount} {errorCount === 1 ? "field" : "fields"}{" "}
            below.
          </p>
        ) : null}

        <ShippingForm
          values={values}
          errors={visibleErrors}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <PaymentMethodSelect value={payment} onChange={setPayment} />

        <div>
          <Button
            type="submit"
            disabled={blocked}
            className="h-12 w-full rounded-md text-base sm:w-auto sm:px-10"
          >
            Place order
          </Button>

          {passedValidation ? (
            <p
              role="status"
              className="mt-4 rounded-md border border-gold/60 bg-[#f6ecd5] px-4 py-3 text-sm text-ink"
            >
              Your details look good, but ordering isn&apos;t available yet.
              Nothing was submitted, saved or charged.
            </p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Ordering and payments aren&apos;t available yet. This page
              previews the checkout experience.
            </p>
          )}
        </div>
      </form>

      <OrderSummary
        entries={purchasable}
        itemCount={summary.itemCount}
        subtotalPaise={summary.subtotalPaise}
        verifying={loading}
      />
    </div>
  );
}