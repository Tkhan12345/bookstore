import Link from "next/link";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

export const dynamic = "force-dynamic";

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        select: {
          id: true,
          titleSnapshot: true,
          quantity: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-forest">
          Your account
        </p>
        <h1 className="mt-2 font-heading text-4xl font-semibold text-forest">
          My Orders
        </h1>
        <p className="mt-3 text-muted-foreground">
          View your purchases and track their status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <Package className="mx-auto size-12 text-forest" />
          <h2 className="mt-4 font-heading text-2xl text-forest">
            No orders yet
          </h2>
          <p className="mt-2 text-muted-foreground">
            Your book orders will appear here.
          </p>
          <Button asChild className="mt-6">
            <Link href="/books">Browse books</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {order.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="mt-1 font-heading text-xl font-semibold text-forest">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {order.items.map((item) => item.titleSnapshot).join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} book(s)
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 text-right">
  <p className="font-semibold text-forest">
    {money(order.totalPaise)}
  </p>

  <OrderStatusBadge status={order.status} />

  <p className="text-xs text-muted-foreground">
    COD · {order.paymentStatus}
  </p>
</div>
              </div>

              <div className="mt-5 border-t pt-4">
                <Button asChild variant="outline">
                  <Link href={`/orders/${order.id}`}>
  Track order
</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}