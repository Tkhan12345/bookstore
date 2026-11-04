
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Package,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { OrderStatusControls } from "@/components/admin/order-status-controls";
import { OrderPaymentControls } from "@/components/admin/order-payment-controls";

export const dynamic = "force-dynamic";

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

function formatDate(date: Date) {
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8 lg:px-10">
      {/* Back navigation */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest"
      >
        <ArrowLeft className="size-4" />
        Back to orders
      </Link>

      {/* Page heading */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Order details
        </p>

        <h1 className="mt-2 font-heading text-3xl font-semibold text-forest">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Placed {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Purchased books */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="flex items-center gap-2 font-heading text-xl font-semibold text-forest">
              <Package className="size-5" />
              Purchased books
            </h2>

            <div className="mt-5 divide-y">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-medium">
                      {item.titleSnapshot}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {money(item.pricePaise)} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {money(item.pricePaise * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(order.subtotalPaise)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{money(order.shippingPaise)}</span>
              </div>

              <div className="flex justify-between text-base font-semibold text-forest">
                <span>Total</span>
                <span>{money(order.totalPaise)}</span>
              </div>
            </div>
          </section>

          {/* Customer information */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-heading text-xl font-semibold text-forest">
              Customer & delivery
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  Customer
                </p>

                <p className="font-medium">
                  {order.user.name ?? order.shippingName}
                </p>

                <p>{order.user.email}</p>
              </div>

              <div>
                <p className="text-muted-foreground">
                  Shipping address
                </p>

                <address className="mt-1 not-italic leading-7">
                  {order.shippingName}
                  <br />
                  {order.shippingLine1}

                  {order.shippingLine2 ? (
                    <>
                      <br />
                      {order.shippingLine2}
                    </>
                  ) : null}

                  <br />
                  {order.shippingCity}, {order.shippingState} -{" "}
                  {order.shippingPostal}
                  <br />
                  Phone: {order.shippingPhone}
                </address>
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Order summary */}
          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-heading text-xl font-semibold text-forest">
              Order summary
            </h2>

            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  Order status
                </dt>

                <dd className="font-semibold">
                  {order.status}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  Payment method
                </dt>

                <dd>Cash on delivery</dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">
                  Payment status
                </dt>

                <dd
                  className={`font-semibold ${
                    order.paymentStatus === "PAID"
                      ? "text-green-700"
                      : order.paymentStatus === "FAILED"
                        ? "text-red-600"
                        : "text-foreground"
                  }`}
                >
                  {order.paymentStatus}
                </dd>
              </div>

              {/* Payment collection timestamp */}
              {order.paidAt ? (
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="size-4" />
                    Collected at
                  </dt>

                  <dd className="text-right font-medium">
                    {formatDate(order.paidAt)}
                  </dd>
                </div>
              ) : null}

              {/* Administrator audit */}
              {order.paidByAdminId ? (
                <div className="flex justify-between gap-4">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    Recorded by
                  </dt>

                  <dd className="max-w-[180px] break-all text-right text-xs">
                    {order.paidByAdminId}
                  </dd>
                </div>
              ) : null}
            </dl>

            {order.paymentStatus === "PAID" &&
            !order.paidAt ? (
              <p className="mt-5 border-t pt-4 text-xs text-muted-foreground">
                Payment was recorded before collection
                timestamps were introduced.
              </p>
            ) : null}
          </section>

          {/* Order fulfillment controls */}
          <OrderStatusControls
            orderId={order.id}
            status={order.status}
          />

          {/* COD payment controls */}
          <OrderPaymentControls
            orderId={order.id}
            orderStatus={order.status}
            paymentStatus={order.paymentStatus}
          />
        </div>
      </div>
    </div>
  );
}
