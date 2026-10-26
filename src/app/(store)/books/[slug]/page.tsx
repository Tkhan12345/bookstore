
import { notFound } from "next/navigation";
import { getBookBySlug } from "@/features/catalog/catalog.service";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) notFound();

  const price = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(book.pricePaise / 100);

  const available =
    (book.inventory?.quantity ?? 0) -
    (book.inventory?.reservedQuantity ?? 0);

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
      <div className="flex min-h-96 items-center justify-center rounded-xl bg-[#A8BBA3] p-10">
        <div className="flex aspect-[3/4] w-2/3 items-center justify-center rounded-r-lg border-l-8 border-[#C69C55] bg-[#18392B] p-6 text-center shadow-2xl">
          <span className="font-editorial text-3xl text-white">
            {book.title}
          </span>
        </div>
      </div>

      <div>
        <h1 className="font-editorial text-4xl">
          {book.title}
        </h1>

        <p className="mt-3 text-gray-600">
          By {book.authors.map((a) => a.name).join(", ")}
        </p>

        <p className="mt-6 text-3xl font-bold text-[#18392B]">
          {price}
        </p>

        <p className="mt-6 leading-8 text-gray-700">
          {book.description}
        </p>

        <p className="mt-6 text-sm font-semibold">
          {available > 0 ? "In Stock" : "Out of Stock"}
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Shopping cart and checkout are coming in Phase 2.
        </p>
      </div>
    </section>
  );
}
