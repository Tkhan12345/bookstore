
import { NextResponse } from "next/server";
import { getBooks } from "@/features/catalog/catalog.service";

// export const runtime = "nodejs";

export async function GET() {
  try {
    const books = await getBooks();

    return NextResponse.json({
      success: true,
      data: books.map((book) => ({
        id: book.id,
        title: book.title,
        slug: book.slug,
        description: book.description,
        pricePaise: book.pricePaise,
        coverImage: book.coverImage,
        authors: book.authors.map((a) => a.name),
        categories: book.categories.map((c) => c.name),
        available:
          (book.inventory?.quantity ?? 0) -
            (book.inventory?.reservedQuantity ?? 0) >
          0,
      })),
    });
  } catch (error) {
    console.error("Catalog request failed", error);

    return NextResponse.json(
      { success: false, error: "Unable to load books" },
      { status: 500 }
    );
  }
}
