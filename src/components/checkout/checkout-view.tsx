
"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
      <div className="space-y-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-full" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { items, clear } = useCart();

  const { statuses, loading } = useLiveStatuses(
    items.map((item) => item.bookId),
  );

  const [values, setValues] = useState<ShippingValues>(EMPTY_VALUES);
  const [touched, setTouched] = useState<
    Partial<Record<ShippingField, boolean>>
  >({});
  const [submitted, setSubmitted] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  const attempt = useRef<{
    fingerprint: string;
    key: string;
  } | null>(null);

  const inFlight = useRef(false);

  const errors = useMemo(() => validateShipping(values), [values]);
  const errorCount = Object.keys(errors).length;

  const resolved = items.map((item) => resolveCartItem(item, statuses));
  const purchasable = resolved.filter(
    (entry) => entry.state !== "unavailable",
  );
  const summary = summarizeCart(resolved);

  const needsReview = resolved.some(
    (entry) => entry.state !== "ok",
  );

  const priceChanged = resolved.some((entry) => {
    const live = statuses?.get(entry.item.bookId);
    return live && live.pricePaise !== entry.item.pricePaise;
  });

  const blocked =
    loading ||
    needsReview ||
    priceChanged ||
    summary.unavailableCount > 0;

  const visibleErrors: FieldErrors = {};

  for (const field of SHIPPING_FIELDS) {
    if ((touched[field] || submitted) && errors[field]) {
      visibleErrors[field] = errors[field];
    }
  }

  function handleChange(field: ShippingField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setServerError(null);
  }

  function handleBlur(field: ShippingField) {
    setTouched((previous) => ({ ...previous, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inFlight.current || completedOrderId) return;

    setSubmitted(true);
    setServerError(null);

    const firstInvalid = SHIPPING_FIELDS.find((field) => errors[field]);

    if (firstInvalid) {
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }

    if (blocked || items.length === 0) {
      setServerError("Please review your cart before placing the order.");
      return;
    }

    const payload = {
      paymentMethod: "cod" as const,
      shipping: values,
      items: items.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
        expectedPricePaise: item.pricePaise,
      })),
    };

    const fingerprint = JSON.stringify(payload);

    if (attempt.current?.fingerprint !== fingerprint) {
      attempt.current = {
        fingerprint,
        key: crypto.randomUUID(),
      };
    }

    inFlight.current = true;
    setPlacing(true);

    try {
      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          idempotencyKey: attempt.current.key,
        }),
      });

      const result: {
        error?: string;
        order?: { id: string };
      } = await response.json();

      if (!response.ok || !result.order?.id) {
        setServerError(
          response.status === 401
            ? "Please sign in to place your order."
            : result.error ?? "Unable to place your order.",
        );
        return;
      }

      setCompletedOrderId(result.order.id);
      clear();
      router.replace(`/orders/${result.order.id}`);
      router.refresh();
    } catch {
      setServerError(
        "Connection failed. Your order may have been received. " +
          "Retry without changing your details to safely check.",
      );
    } finally {
      inFlight.current = false;
      setPlacing(false);
    }
  }

  if (!hydrated) return <CheckoutSkeleton />;

  if (completedOrderId) {
    return (
      <div className="mt-10 rounded-lg border bg-white p-8">
        <h2 className="font-heading text-2xl text-forest">
          Order received!
        </h2>
        <p className="mt-3 text-muted-foreground">
          Opening your order confirmation...
        </p>
        <Button asChild className="mt-5">
          <Link href={`/orders/${completedOrderId}`}>
            View order
          </Link>
        </Button>
      </div>
    );
  }

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

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-12">
      <form onSubmit={handleSubmit} noValidate className="min-w-0 space-y-10">
        {blocked && !loading ? (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/40 bg-white px-4 py-3 text-sm text-ink"
          >
            <AlertTriangle className="size-4 text-destructive" />
            <span>
              Some books need review because their price, stock, or
              availability changed.
            </span>
            <Button asChild variant="outline" className="h-9">
              <Link href="/cart">Review cart</Link>
            </Button>
          </div>
        ) : null}

        {submitted && errorCount > 0 ? (
          <p role="alert" className="text-sm text-destructive">
            Please correct {errorCount} shipping field(s).
          </p>
        ) : null}

        {serverError ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-white px-4 py-3 text-sm text-destructive"
          >
            {serverError}
          </div>
        ) : null}

        <ShippingForm
          values={values}
          errors={visibleErrors}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <PaymentMethodSelect
          value="cod"
          onChange={() => {}}
        />

        <div>
          <Button
            type="submit"
            disabled={blocked || placing}
            className="h-12 w-full rounded-md text-base sm:w-auto sm:px-10"
          >
            {placing ? "Placing order..." : "Place COD order"}
          </Button>

          <p className="mt-3 text-xs text-muted-foreground">
            Free shipping. Payment is collected on delivery.
            No online payment is charged.
          </p>
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
