import { UpdateStock } from "@/components/admin/update-stock";
import Link from "next/link";
import { Package, AlertTriangle } from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

export default async function AdminInventoryPage() {
  await requireAdmin();

  const books = await prisma.book.findMany({
    select: {
      id: true,
      title: true,
      active: true,
      inventory: {
        select: {
          quantity: true,
          reservedQuantity: true,
        },
      },
    },
    orderBy: { title: "asc" },
  });

  const rows = books.map((book) => {
    const quantity = book.inventory?.quantity ?? 0;
    const reserved = book.inventory?.reservedQuantity ?? 0;
    const available = quantity - reserved;

    return {
      ...book,
      quantity,
      reserved,
      available,
      configured: book.inventory !== null,
    };
  });

  const lowStock = rows.filter(
    (book) => book.configured && book.available > 0 && book.available <= 5
  ).length;

  const outOfStock = rows.filter(
    (book) => book.configured && book.available <= 0
  ).length;

  const missingInventory = rows.filter(
    (book) => !book.configured
  ).length;

  return (
    <main className="px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-[#18392b]">
            Stock Management
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">
            Inventory
          </h1>
          <p className="mt-3 text-muted-foreground">
            Monitor book availability and stock levels.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <Package className="mb-3 size-5 text-[#18392b]" />
            <p className="text-sm text-muted-foreground">Total Titles</p>
            <p className="mt-1 text-3xl font-semibold">{rows.length}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <AlertTriangle className="mb-3 size-5 text-amber-600" />
            <p className="text-sm text-muted-foreground">Low Stock</p>
            <p className="mt-1 text-3xl font-semibold">{lowStock}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <AlertTriangle className="mb-3 size-5 text-red-600" />
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="mt-1 text-3xl font-semibold">{outOfStock}</p>
          </div>
        </div>

        {missingInventory > 0 && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            {missingInventory} book(s) have no inventory record configured.
          </p>
        )}

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border p-6">
            <h2 className="font-serif text-xl font-semibold">
              Stock Overview
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Book</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Reserved</th>
                  <th className="px-6 py-4">Available</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((book) => {
                  const status = !book.configured
                    ? "Not configured"
                    : book.available <= 0
                      ? "Out of stock"
                      : book.available <= 5
                        ? "Low stock"
                        : "In stock";

                  return (
                    <tr key={book.id} className="border-t border-border">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/books/${book.id}/edit`}
                          className="font-medium text-[#18392b] hover:underline"
                        >
                          {book.title}
                        </Link>
                        {!book.active && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Inactive
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">{book.quantity}</td>
                      <td className="px-6 py-4">{book.reserved}</td>
                      <td className="px-6 py-4">{book.available}</td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            status === "In stock"
                              ? "text-emerald-700"
                              : status === "Low stock"
                                ? "text-amber-700"
                                : "text-red-700"
                          }
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <UpdateStock
                          key={`${book.id}-${book.quantity}-${book.reserved}`}
                          bookId={book.id}
                          bookTitle={book.title}
                          currentQuantity={book.quantity}
                          reservedQuantity={book.reserved}
                        />
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No books found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

