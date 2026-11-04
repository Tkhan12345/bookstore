import Link from "next/link";
import { BookOpen } from "lucide-react";

import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

export default async function AdminBooksPage() {
  await requireAdmin();

  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      pricePaise: true,
      active: true,
      featured: true,
      inventory: {
        select: {
          quantity: true,
          reservedQuantity: true,
        },
      },
      authors: {
        select: { name: true },
      },
    },
  });

  return (
    <main className="px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-forest">
              Catalogue Management
            </p>
            <h1 className="mt-2 font-serif text-4xl font-semibold">
              Books
            </h1>
            <p className="mt-3 text-muted-foreground">
              Manage your bookstore catalogue and inventory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-lg border border-border bg-card px-4 py-2 text-sm">
              {books.length} books
            </span>

            <Link
              href="/admin/books/new"
              className="rounded-lg bg-[#18392b] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#24523e]"
            >
              + Add New Book
            </Link>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border p-6">
            <BookOpen className="size-5 text-forest" />
            <h2 className="font-serif text-xl font-semibold">
              Book Catalogue
            </h2>
          </div>

          {books.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No books found in the catalogue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/40 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Book</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4">Preview</th>
                  </tr>
                </thead>

                <tbody>
                  {books.map((book) => {
                    const available = book.inventory
                      ? book.inventory.quantity -
                        book.inventory.reservedQuantity
                      : null;

                    return (
                      <tr
                        key={book.id}
                        className="border-t border-border"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium">{book.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {book.authors.map((author) => author.name).join(", ") ||
                              "Unknown author"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          {currency.format(book.pricePaise / 100)}
                        </td>

                        <td className="px-6 py-4">
                          {available === null
                            ? "Not configured"
                            : `${available} available`}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={
                              book.active
                                ? "font-medium text-emerald-700"
                                : "text-muted-foreground"
                            }
                          >
                            {book.active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {book.featured ? "Yes" : "No"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <Link
                              href={`/books/${book.slug}`}
                              className="font-medium text-forest underline underline-offset-4"
                            >
                              View
                            </Link>
                            <Link
                              href={`/admin/books/${book.id}/edit`}
                              className="font-medium text-forest underline underline-offset-4"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


