import { ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function RecentOrders() {
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      totalPaise: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return (
    <section className="rounded-xl border border-border bg-card p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg bg-secondary text-forest">
          <ShoppingBag className="size-5" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold">
            Recent Orders
          </h2>
          <p className="text-sm text-muted-foreground">
            Your five most recent customer orders
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center">
          <ShoppingBag className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer orders will appear here once checkout is implemented.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="py-4 pr-4">
                    <p className="font-medium">
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.createdAt.toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <p>{order.user.name ?? "Customer"}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.user.email}
                    </p>
                  </td>
                  <td className="py-4 pr-4">{order.status}</td>
                  <td className="py-4 pr-4">{order.paymentStatus}</td>
                  <td className="py-4 text-right font-medium">
                    {currency.format(order.totalPaise / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
