import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { NewBookForm } from "@/components/admin/new-book-form";

export default async function NewBookPage() {
  await requireAdmin();

  const [authors, categories] = await Promise.all([
    prisma.author.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-forest">
          Catalogue Management
        </p>

        <h1 className="mt-2 font-serif text-4xl font-semibold">
          Add New Book
        </h1>

        <p className="mt-3 mb-8 text-muted-foreground">
          Add a new title to your bookstore catalogue.
        </p>

        <NewBookForm authors={authors} categories={categories} />
      </div>
    </main>
  );
}
