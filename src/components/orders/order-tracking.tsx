import type { OrderStatus } from "@prisma/client";
import { Check, Package, Truck, PackageCheck, Clock, XCircle } from "lucide-react";

const steps = [
  { status: "CONFIRMED", label: "Confirmed", icon: Check },
  { status: "PROCESSING", label: "Processing", icon: Package },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: PackageCheck },
] as const;

type Props = {
  status: OrderStatus;
};

export function OrderTracking({ status }: Props) {
  if (status === "CANCELLED") {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3 text-red-700">
          <XCircle className="size-6" />
          <h2 className="font-semibold">Order cancelled</h2>
        </div>
        <p className="mt-2 text-sm text-red-700">
          This order was cancelled and will not be delivered.
        </p>
      </section>
    );
  }

  if (status === "PENDING") {
    return (
      <section className="rounded-xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <Clock className="size-6 text-amber-600" />
          <h2 className="font-semibold">Order pending</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Your order is awaiting confirmation.
        </p>
      </section>
    );
  }

  const currentIndex = steps.findIndex((step) => step.status === status);

  return (
    <section className="rounded-xl border bg-white p-6">
      <h2 className="font-heading text-xl font-semibold text-[#18392b]">
        Track your order
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Follow your order from confirmation to delivery.
      </p>

      <ol className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {steps.map((step, index) => {
          const completed = index <= currentIndex;
          const Icon = step.icon;

          return (
            <li key={step.status} className="flex flex-col items-center text-center">
              <div
                className={`flex size-12 items-center justify-center rounded-full border-2 ${
                  completed
                    ? "border-[#18392b] bg-[#18392b] text-white"
                    : "border-gray-200 bg-gray-50 text-gray-400"
                }`}
              >
                <Icon className="size-5" />
              </div>

              <p className={`mt-3 text-sm font-semibold ${
                completed ? "text-[#18392b]" : "text-muted-foreground"
              }`}>
                {step.label}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {index < currentIndex
                  ? "Completed"
                  : index === currentIndex
                    ? "Current status"
                    : "Upcoming"}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}