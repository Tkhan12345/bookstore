import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      items: true,
    },
  });

  if (!order) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-10">
        <CheckCircle2
          className="mb-5 size-12 text-forest"
          aria-hidden="true"
        />

        <h1 className="font-heading text-3xl font-semibold text-forest">
          Order placed successfully!
        </h1>

        <p className="mt-3 text-muted-foreground">
          Thank you for shopping with BookStore.
          Your cash-on-delivery order has been received.
        </p>

        <div className="mt-8 grid gap-4 rounded-lg bg-secondary/40 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Order number</p>
            <p className="mt-1 break-all font-medium">{order.id}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Order status</p>
            <p className="mt-1 font-medium">{order.status}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Payment</p>
            <p className="mt-1 font-medium">Cash on delivery</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="mt-1 font-semibold text-forest">
              {money(order.totalPaise)}
            </p>
          </div>
        </div>

        <h2 className="mt-10 font-heading text-2xl font-semibold text-forest">
          Order items
        </h2>

        <div className="mt-4 divide-y">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between gap-4 py-4 text-sm"
            >
              <div>
                <p className="font-medium">{item.titleSnapshot}</p>
                <p className="text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
              </div>

              <p className="font-semibold">
                {money(item.pricePaise * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <h2 className="mt-8 font-heading text-2xl font-semibold text-forest">
          Delivery address
        </h2>

        <address className="mt-3 text-sm leading-7 not-italic text-muted-foreground">
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
          {order.shippingCity}, {order.shippingState} - {order.shippingPostal}
          <br />
          Phone: {order.shippingPhone}
        </address>

        <Button asChild className="mt-10">
          <Link href="/books">Continue shopping</Link>
        </Button>
      </div>
    </main>
  );
}