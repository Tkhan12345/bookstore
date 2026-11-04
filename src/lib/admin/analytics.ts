
import { prisma } from "@/lib/prisma";

export type AnalyticsRange = "7d" | "30d" | "90d" | "all";
export type ChartInterval = "daily" | "weekly" | "monthly";

export function parseAnalyticsRange(value?: string): AnalyticsRange {
  if (value === "7d" || value === "30d" || value === "90d") {
    return value;
  }
  return "all";
}

export function parseChartInterval(value?: string): ChartInterval {
  if (value === "daily" || value === "weekly" || value === "monthly") {
    return value;
  }
  return "daily";
}

function rangeStart(range: AnalyticsRange): Date | undefined {
  if (range === "all") return undefined;

  const days = Number.parseInt(range, 10);
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days + 1);

  return date;
}

function bucketKey(date: Date, interval: ChartInterval): string {
  const d = new Date(date);

  if (interval === "weekly") {
    const weekday = d.getUTCDay();
    const offset = (weekday + 6) % 7;
    d.setUTCDate(d.getUTCDate() - offset);
  }

  if (interval === "monthly") {
    d.setUTCDate(1);
  }

  return d.toISOString().slice(0, 10);
}

function bucketLabel(key: string, interval: ChartInterval): string {
  const date = new Date(`${key}T00:00:00.000Z`);

  if (interval === "monthly") {
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    });
  }

  const formatted = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  return interval === "weekly" ? `Week ${formatted}` : formatted;
}

export async function getAdminAnalytics(
  range: AnalyticsRange = "all",
  interval: ChartInterval = "daily",
) {
  const start = rangeStart(range);

  const [orders, inventory, recentOrders] = await Promise.all([
    prisma.order.findMany({
      where: start ? { createdAt: { gte: start } } : {},
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalPaise: true,
        createdAt: true,
        paidAt: true,
        items: {
          select: {
            bookId: true,
            titleSnapshot: true,
            quantity: true,
            pricePaise: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),

    prisma.inventory.findMany({
      include: {
        book: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    }),

    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalPaise: true,
        createdAt: true,
      },
    }),
  ]);

  const totalOrders = orders.length;

  const paidOrders = orders.filter(
    (order) =>
      order.paymentStatus === "PAID" &&
      order.status !== "CANCELLED",
  );

  const unpaidOrders = orders.filter(
    (order) =>
      order.paymentStatus === "PENDING" &&
      order.status !== "CANCELLED",
  );

  const cancelledOrders = orders.filter(
    (order) => order.status === "CANCELLED",
  );

  const activeOrders = orders.filter((order) =>
    ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(
      order.status,
    ),
  ).length;

  const collectedRevenuePaise = paidOrders.reduce(
    (sum, order) => sum + order.totalPaise,
    0,
  );

  const pendingCodPaise = unpaidOrders.reduce(
    (sum, order) => sum + order.totalPaise,
    0,
  );

  const cancelledValuePaise = cancelledOrders.reduce(
    (sum, order) => sum + order.totalPaise,
    0,
  );

  const grossOrderValuePaise = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.totalPaise, 0);

  const averageOrderValuePaise =
    paidOrders.length > 0
      ? Math.round(collectedRevenuePaise / paidOrders.length)
      : 0;

  const cancellationRate =
    totalOrders > 0
      ? (cancelledOrders.length / totalOrders) * 100
      : 0;

  const collectionRate =
    totalOrders - cancelledOrders.length > 0
      ? (paidOrders.length /
          (totalOrders - cancelledOrders.length)) *
        100
      : 0;

  const statusNames = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ] as const;

  const statusDistribution = statusNames.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  const booksMap = new Map<
    string,
    {
      id: string;
      title: string;
      quantity: number;
      salesPaise: number;
    }
  >();

  for (const order of orders) {
    if (order.status === "CANCELLED") continue;

    for (const item of order.items) {
      const current = booksMap.get(item.bookId);

      if (current) {
        current.quantity += item.quantity;
        current.salesPaise += item.pricePaise * item.quantity;
      } else {
        booksMap.set(item.bookId, {
          id: item.bookId,
          title: item.titleSnapshot,
          quantity: item.quantity,
          salesPaise: item.pricePaise * item.quantity,
        });
      }
    }
  }

  const topBooks = Array.from(booksMap.values())
    .sort(
      (a, b) =>
        b.quantity - a.quantity ||
        b.salesPaise - a.salesPaise ||
        a.title.localeCompare(b.title),
    )
    .slice(0, 5);

  const lowStock = inventory
    .map((item) => ({
      id: item.id,
      title: item.book.title,
      slug: item.book.slug,
      available: item.quantity - item.reservedQuantity,
    }))
    .filter((item) => item.available <= 5)
    .sort((a, b) => a.available - b.available)
    .slice(0, 5);

  const trendMap = new Map<
    string,
    { revenuePaise: number; orders: number }
  >();

  // Revenue is grouped by collection date where available.
  // Legacy paid orders without paidAt use their order date.
  for (const order of orders) {
    const orderKey = bucketKey(order.createdAt, interval);
    const orderBucket = trendMap.get(orderKey) ?? {
      revenuePaise: 0,
      orders: 0,
    };

    orderBucket.orders += 1;
    trendMap.set(orderKey, orderBucket);

    if (
      order.paymentStatus === "PAID" &&
      order.status !== "CANCELLED"
    ) {
      const paymentKey = bucketKey(
        order.paidAt ?? order.createdAt,
        interval,
      );

      const paymentBucket = trendMap.get(paymentKey) ?? {
        revenuePaise: 0,
        orders: 0,
      };

      paymentBucket.revenuePaise += order.totalPaise;
      trendMap.set(paymentKey, paymentBucket);
    }
  }

  // Fill missing periods so the charts show a continuous timeline.
  const dates = [
    ...orders.map((order) => order.createdAt),
    ...paidOrders.map((order) => order.paidAt ?? order.createdAt),
  ];

  const firstDate = start ??
    (dates.length > 0
      ? new Date(Math.min(...dates.map((date) => date.getTime())))
      : new Date());

  const cursor = new Date(
    `${bucketKey(firstDate, interval)}T00:00:00.000Z`,
  );

  const end = new Date();
  const endKey = bucketKey(end, interval);

  const trend: {
    key: string;
    label: string;
    revenuePaise: number;
    orders: number;
  }[] = [];

  let safety = 0;

  while (
    bucketKey(cursor, interval) <= endKey &&
    safety < 500
  ) {
    const key = bucketKey(cursor, interval);
    const values = trendMap.get(key) ?? {
      revenuePaise: 0,
      orders: 0,
    };

    trend.push({
      key,
      label: bucketLabel(key, interval),
      ...values,
    });

    if (interval === "monthly") {
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    } else {
      cursor.setUTCDate(
        cursor.getUTCDate() + (interval === "weekly" ? 7 : 1),
      );
    }

    safety += 1;
  }

  return {
    range,
    interval,
    totalOrders,
    paidOrderCount: paidOrders.length,
    activeOrders,
    cancelledOrderCount: cancelledOrders.length,
    collectedRevenuePaise,
    pendingCodPaise,
    cancelledValuePaise,
    grossOrderValuePaise,
    averageOrderValuePaise,
    cancellationRate,
    collectionRate,
    statusDistribution,
    topBooks,
    lowStock,
    recentOrders,
    trend,
  };
}
