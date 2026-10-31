"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { CheckCircle2, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  orderId: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
};

export function OrderPaymentControls({
  orderId,
  orderStatus,
  paymentStatus,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eligible =
    orderStatus === "DELIVERED" &&
    paymentStatus === "PENDING";

  async function markAsPaid() {
    if (busy || !eligible) return;

    const confirmed = window.confirm(
      "Have you actually collected the cash from the customer? Confirm only after receiving payment.",
    );

    if (!confirmed) return;

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/admin/orders/${orderId}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentStatus: "PAID",
          }),
        },
      );

      const result: { error?: string } = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to record payment.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-forest">
        <Wallet className="size-5" />
        Payment collection
      </h2>

      <p className="mt-3 text-sm text-muted-foreground">
        Method: Cash on delivery
      </p>

      <p className="mt-1 text-sm">
        Payment status: <strong>{paymentStatus}</strong>
      </p>

      {paymentStatus === "PAID" ? (
        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-green-700">
          <CheckCircle2 className="size-5" />
          Payment collected
        </div>
      ) : eligible ? (
        <div className="mt-5 space-y-3">
          <p className="text-xs text-muted-foreground">
            Only record payment after cash has been received.
          </p>

          <Button
            type="button"
            disabled={busy}
            onClick={markAsPaid}
          >
            {busy ? "Recording payment..." : "Mark as Paid"}
          </Button>
        </div>
      ) : (
        <p className="mt-5 text-sm text-muted-foreground">
          {orderStatus === "CANCELLED"
            ? "Cancelled orders cannot collect payment."
            : "Payment can be recorded after delivery."}
        </p>
      )}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </section>
  );
}