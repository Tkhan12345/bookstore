import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
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
  });

return (
  <div className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8 lg:px-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
          Order management
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Orders
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review customer purchases and fulfillment status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-muted-foreground">Recent orders</p>
          <p className="mt-2 text-3xl font-semibold">{orders.length}</p>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-muted-foreground">Confirmed</p>
          <p className="mt-2 text-3xl font-semibold">
            {orders.filter((order) => order.status === "CONFIRMED").length}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5">
          <p className="text-sm text-muted-foreground">Recent order value</p>
          <p className="mt-2 text-3xl font-semibold">
            {money(
              orders
                .filter((order) => order.status !== "CANCELLED")
                .reduce((sum, order) => sum + order.totalPaise, 0),
            )}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Items</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Date</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/20">
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
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>

                <td className="px-5 py-4 font-medium">
                  {money(order.totalPaise)}
                </td>

                <td className="px-5 py-4">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                    {order.status}
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
    </div>
  );
}