import { RecentOrders } from "@/components/admin/recent-orders";
import { InventoryOverview } from "@/components/admin/inventory-overview";
import Link from "next/link";
import {
  BookOpen,
  IndianRupee,
  ShoppingBag,
  Users,
} from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [totalBooks, totalCustomers, totalOrders, revenue] =
    await Promise.all([
      prisma.book.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalPaise: true },
      }),
    ]);

  const totalRevenue = (revenue._sum.totalPaise ?? 0) / 100;

  const stats = [
    {
      label: "Total Books",
      value: totalBooks.toLocaleString("en-IN"),
      icon: BookOpen,
    },
    {
      label: "Customers",
      value: totalCustomers.toLocaleString("en-IN"),
      icon: Users,
    },
    {
      label: "Orders",
      value: totalOrders.toLocaleString("en-IN"),
      icon: ShoppingBag,
    },
    {
      label: "Paid Revenue",
      value: totalRevenue.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }),
      icon: IndianRupee,
    },
  ];

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-forest">
              BookStore Administration
            </p>
            <h1 className="font-serif text-4xl font-semibold text-foreground">
              Dashboard Overview
            </h1>
            <p className="mt-3 text-muted-foreground">
              Welcome back, {admin.name ?? "Administrator"}.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
          >
            Back to bookstore
          </Link>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-6 flex size-11 items-center justify-center rounded-lg bg-secondary text-forest">
                  <Icon className="size-5" />
                </div>

                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>

                <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </section>

        <InventoryOverview />

        <RecentOrders />

        <section className="rounded-xl border border-border bg-card p-7">
          <h2 className="font-serif text-2xl font-semibold">
            Store Management
          </h2>
          <p className="mt-2 text-muted-foreground">
            Book management, inventory monitoring, customer records,
            and order operations are coming next.
          </p>
        </section>
      </div>
    </main>
  );
}


