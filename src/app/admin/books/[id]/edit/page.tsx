import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/prisma";
import { EditBookForm } from "@/components/admin/edit-book-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBookPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;

  const [book, authors, categories] = await Promise.all([
    prisma.book.findUnique({
      where: { id },
      include: {
        authors: { select: { id: true } },
        categories: { select: { id: true } },
      },
    }),
    prisma.author.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!book) {
    notFound();
  }

  return (
    <main className="px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-[#18392b]">
          Catalogue Management
        </p>

        <h1 className="mt-2 font-serif text-4xl font-semibold">
          Edit Book
        </h1>

        <p className="mb-8 mt-3 text-muted-foreground">
          Update the details of {book.title}.
        </p>

        <EditBookForm
          book={{
            id: book.id,
            title: book.title,
            slug: book.slug,
            description: book.description,
            isbn: book.isbn ?? "",
            pricePaise: book.pricePaise,
            coverImage: book.coverImage ?? "",
            authorIds: book.authors.map((author) => author.id),
            categoryIds: book.categories.map((category) => category.id),
            featured: book.featured,
            active: book.active,
          }}
          authors={authors}
          categories={categories}
        />
      </div>
    </main>
  );
}