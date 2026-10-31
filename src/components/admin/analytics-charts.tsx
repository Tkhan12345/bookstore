
"use client";

type TrendPoint = {
  key: string;
  label: string;
  revenuePaise: number;
  orders: number;
};

type StatusPoint = {
  status: string;
  count: number;
};

type BookPoint = {
  id: string;
  title: string;
  quantity: number;
  salesPaise: number;
};

type Props = {
  trend: TrendPoint[];
  statusDistribution: StatusPoint[];
  topBooks: BookPoint[];
};

function money(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function AnalyticsCharts({
  trend,
  statusDistribution,
  topBooks,
}: Props) {
  const maxRevenue = Math.max(
    1,
    ...trend.map((point) => point.revenuePaise),
  );

  const maxOrders = Math.max(
    1,
    ...trend.map((point) => point.orders),
  );

  const totalStatuses = statusDistribution.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const maxBookSales = Math.max(
    1,
    ...topBooks.map((book) => book.quantity),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-heading text-xl font-semibold text-forest">
            Revenue trend
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Collected payment value by period
          </p>

          <div className="mt-8 overflow-x-auto">
            <div className="flex h-56 min-w-[360px] items-end gap-2 border-b pb-2">
              {trend.map((point) => (
                <div
                  key={point.key}
                  className="group relative flex h-full min-w-2 flex-1 items-end justify-center"
                  title={`${point.label}: ${money(point.revenuePaise)}`}
                >
                  <div
                    className="w-full max-w-12 rounded-t bg-[#18392b] transition-opacity hover:opacity-75"
                    style={{
                      height: `${
                        point.revenuePaise > 0
                          ? Math.max(
                              4,
                              (point.revenuePaise / maxRevenue) * 100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{trend[0]?.label ?? "No data"}</span>
              <span>{trend.at(-1)?.label ?? ""}</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Hover over a bar to see its value. Historical payments
            without timestamps use their order dates.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-heading text-xl font-semibold text-forest">
            Order volume
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Number of orders placed by period
          </p>

          <div className="mt-8 overflow-x-auto">
            <div className="flex h-56 min-w-[360px] items-end gap-2 border-b pb-2">
              {trend.map((point) => (
                <div
                  key={point.key}
                  className="flex h-full min-w-2 flex-1 items-end justify-center"
                  title={`${point.label}: ${point.orders} orders`}
                >
                  <div
                    className="w-full max-w-12 rounded-t bg-[#a8bba3] transition-opacity hover:opacity-75"
                    style={{
                      height: `${
                        point.orders > 0
                          ? Math.max(
                              4,
                              (point.orders / maxOrders) * 100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{trend[0]?.label ?? "No data"}</span>
              <span>{trend.at(-1)?.label ?? ""}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-heading text-xl font-semibold text-forest">
            Order status distribution
          </h2>

          <div className="mt-6 space-y-4">
            {statusDistribution.map((item) => {
              const percentage =
                totalStatuses > 0
                  ? (item.count / totalStatuses) * 100
                  : 0;

              return (
                <div key={item.status}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="capitalize">
                      {item.status.toLowerCase()}
                    </span>
                    <span className="font-semibold">
                      {item.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        item.status === "CANCELLED"
                          ? "bg-red-400"
                          : "bg-[#18392b]"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-heading text-xl font-semibold text-forest">
            Best-selling books
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ranked by copies sold, excluding cancelled orders
          </p>

          {topBooks.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              No sales recorded.
            </p>
          ) : (
            <div className="mt-6 space-y-5">
              {topBooks.map((book) => (
                <div key={book.id}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="font-medium">{book.title}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {book.quantity} sold
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#18392b]"
                      style={{
                        width: `${
                          (book.quantity / maxBookSales) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {money(book.salesPaise)} order-item value
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
