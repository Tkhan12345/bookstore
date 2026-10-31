
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

function paymentBadge(status: string) {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-amber-100 text-amber-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    case "REFUNDED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default async function AdminOrdersPage() {
  const [orders, totals] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          select: {
            id: true,
            titleSnapshot: true,
            quantity: true,
          },
        },
      },
    }),
    prisma.order.groupBy({
      by: ["status", "paymentStatus"],
      _sum: {
        totalPaise: true,
      },
    }),
  ]);

  // Financial totals are calculated across all orders,
  // not just the 100 most recent orders in the table.
  const collectedRevenue = totals
    .filter(
      (row) =>
        row.paymentStatus === "PAID" &&
        row.status !== "CANCELLED",
    )
    .reduce(
      (sum, row) => sum + (row._sum.totalPaise ?? 0),
      0,
    );

  const pendingCod = totals
    .filter(
      (row) =>
        row.paymentStatus === "PENDING" &&
        row.status !== "CANCELLED",
    )
    .reduce(
      (sum, row) => sum + (row._sum.totalPaise ?? 0),
      0,
    );

  const cancelledValue = totals
    .filter((row) => row.status === "CANCELLED")
    .reduce(
      (sum, row) => sum + (row._sum.totalPaise ?? 0),
      0,
    );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8 lg:px-10">
      {/* Page heading */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
          Order management
        </p>

        <h1 className="mt-2 font-heading text-3xl font-semibold text-forest">
          Orders
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Review purchases, fulfillment, and COD collections.
        </p>
      </div>

      {/* Financial summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Collected revenue
          </p>
          <p className="mt-2 text-3xl font-semibold text-forest">
            {money(collectedRevenue)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Payments marked as collected
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Pending COD
          </p>
          <p className="mt-2 text-3xl font-semibold text-forest">
            {money(pendingCod)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Unpaid, non-cancelled orders
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-muted-foreground">
            Cancelled order value
          </p>
          <p className="mt-2 text-3xl font-semibold text-forest">
            {money(cancelledValue)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Value of cancelled orders
          </p>
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Items</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Payment</th>
              <th className="px-5 py-4">Date</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-muted/20"
              >
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-semibold text-forest hover:underline"
                  >
                    #{order.id.slice(-8).toUpperCase()}
                  </Link>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium">
                    {order.user.name ?? order.shippingName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.user.email}
                  </p>
                </td>

                <td className="px-5 py-4">
                  {order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  )}
                </td>

                <td className="px-5 py-4 font-medium">
                  {money(order.totalPaise)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status === "DELIVERED"
                        ? "bg-green-100 text-green-800"
                        : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : order.status === "SHIPPED"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "PROCESSING"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-secondary text-foreground"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentBadge(
                      order.paymentStatus,
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>

                <td className="px-5 py-4 text-muted-foreground">
                  {order.createdAt.toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">
            No orders found.
          </p>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing the 100 most recent orders. Financial totals
        include all orders.
      </p>
    </div>
  );
}
