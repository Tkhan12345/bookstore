
import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  IndianRupee,
  Package,
  ShoppingBag,
  TrendingUp,
  Truck,
  Wallet,
} from "lucide-react";

import {
  getAdminAnalytics,
  parseAnalyticsRange,
  parseChartInterval,
} from "@/lib/admin/analytics";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";

export const dynamic = "force-dynamic";

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(paise / 100);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    interval?: string;
  }>;
}) {
  const params = await searchParams;

  const range = parseAnalyticsRange(params.range);
  const interval = parseChartInterval(params.interval);

  const data = await getAdminAnalytics(range, interval);

  const cards = [
    {
      label: "Collected revenue",
      value: money(data.collectedRevenuePaise),
      description: "Paid orders in selected period",
      icon: IndianRupee,
    },
    {
      label: "Total orders",
      value: String(data.totalOrders),
      description: "Orders placed in selected period",
      icon: ShoppingBag,
    },
    {
      label: "Active orders",
      value: String(data.activeOrders),
      description: "Awaiting fulfillment",
      icon: Truck,
    },
    {
      label: "Pending COD",
      value: money(data.pendingCodPaise),
      description: "Uncollected order value",
      icon: Wallet,
    },
    {
      label: "Average paid order",
      value: money(data.averageOrderValuePaise),
      description: "Average value of paid orders",
      icon: TrendingUp,
    },
    {
      label: "Paid orders",
      value: String(data.paidOrderCount),
      description: "Payments collected",
      icon: Package,
    },
    {
      label: "Cancellation rate",
      value: `${data.cancellationRate.toFixed(1)}%`,
      description: `${data.cancelledOrderCount} cancelled orders`,
      icon: CircleAlert,
    },
    {
      label: "Collection rate",
      value: `${data.collectionRate.toFixed(1)}%`,
      description: "Paid / non-cancelled orders",
      icon: TrendingUp,
    },
    {
      label: "Cancelled order value",
      value: money(data.cancelledValuePaise),
      description: "Value of cancelled orders",
      icon: CircleAlert,
    },
  ];

  const ranges = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "all", label: "All time" },
  ] as const;

  const intervals = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ] as const;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
            Administration
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold text-forest">
            Store analytics
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sales, fulfillment, customer orders, and inventory.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ranges.map((item) => (
            <Link
              key={item.value}
              href={`/admin?range=${item.value}&interval=${interval}`}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                range === item.value
                  ? "border-[#18392b] bg-[#18392b] text-white"
                  : "bg-white text-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {card.label}
                </p>
                <Icon className="size-5 shrink-0 text-forest" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-forest">
                {card.value}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-forest">
            Sales performance
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Revenue and order trends
          </p>
        </div>

        <div className="flex gap-2">
          {intervals.map((item) => (
            <Link
              key={item.value}
              href={`/admin?range=${range}&interval=${item.value}`}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                interval === item.value
                  ? "border-[#18392b] bg-[#18392b] text-white"
                  : "bg-white hover:bg-muted"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <AnalyticsCharts
        trend={data.trend}
        statusDistribution={data.statusDistribution}
        topBooks={data.topBooks}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-xl font-semibold text-forest">
              Low-stock alerts
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-semibold text-forest hover:underline"
            >
              View inventory
            </Link>
          </div>

          {data.lowStock.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">
              No low-stock books.
            </p>
          ) : (
            <div className="mt-5 divide-y">
              {data.lowStock.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <p className="text-sm font-medium">{book.title}</p>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      book.available <= 0
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {book.available <= 0
                      ? "Out of stock"
                      : `${book.available} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-heading text-xl font-semibold text-forest">
            Financial summary
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                Non-cancelled order value
              </span>
              <strong>{money(data.grossOrderValuePaise)}</strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                Collected payments
              </span>
              <strong className="text-green-700">
                {money(data.collectedRevenuePaise)}
              </strong>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                Pending COD
              </span>
              <strong>{money(data.pendingCodPaise)}</strong>
            </div>

            <div className="flex justify-between gap-4 border-t pt-4">
              <span className="text-muted-foreground">
                Cancelled order value
              </span>
              <strong>{money(data.cancelledValuePaise)}</strong>
            </div>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Amounts reflect the selected order-date range.
            Revenue is based on orders marked paid, not
            accounting profit.
          </p>
        </section>
      </div>

      <section className="rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-heading text-xl font-semibold text-forest">
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>

        {data.recentOrders.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          <div className="mt-5 divide-y">
            {data.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-muted/20"
              >
                <div>
                  <p className="font-semibold text-forest">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.createdAt.toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {money(order.totalPaise)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.status} · {order.paymentStatus}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
