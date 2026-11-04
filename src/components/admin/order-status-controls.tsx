"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const labels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

type Props = {
  orderId: string;
  status: OrderStatus;
};

export function OrderStatusControls({ orderId, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = transitions[status];

  async function updateStatus(next: OrderStatus) {
    if (busy) return;

    if (
      next === "CANCELLED" &&
      !window.confirm(
        "Cancel this order and restore its inventory? This cannot be undone.",
      )
    ) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/v1/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        },
      );

      const result: { error?: string } = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to update order.");
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
      <h2 className="font-heading text-xl font-semibold text-forest">
        Manage order
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Current status: <strong>{labels[status]}</strong>
      </p>

      {options.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          This order has reached its final status.
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap gap-3">
          {options.map((next) => (
            <Button
              key={next}
              type="button"
              disabled={busy}
              variant={next === "CANCELLED" ? "destructive" : "default"}
              onClick={() => updateStatus(next)}
            >
              {busy ? "Updating..." : next === "CANCELLED"
                ? "Cancel order"
                : `Mark as ${labels[next]}`}
            </Button>
          ))}
        </div>
      )}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}