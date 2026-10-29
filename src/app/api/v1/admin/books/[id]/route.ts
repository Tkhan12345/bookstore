import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getAdminForApi } from "@/lib/auth/admin-api";
import { prisma } from "@/lib/prisma";
import { updateBookSchema } from "@/lib/validation/book";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const admin = await getAdminForApi();

  if (admin.error) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.error === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  const { id } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = updateBookSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const authorIds = [...new Set(data.authorIds)];
  const categoryIds = [...new Set(data.categoryIds)];

  try {
    const [authorCount, categoryCount] = await Promise.all([
      prisma.author.count({ where: { id: { in: authorIds } } }),
      prisma.category.count({ where: { id: { in: categoryIds } } }),
    ]);

    if (
      authorCount !== authorIds.length ||
      categoryCount !== categoryIds.length
    ) {
      return NextResponse.json(
        { error: "Invalid author or category selection" },
        { status: 400 }
      );
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        isbn: data.isbn || null,
        pricePaise: data.pricePaise,
        coverImage: data.coverImage || null,
        featured: data.featured,
        active: data.active,
        authors: {
          set: authorIds.map((authorId) => ({ id: authorId })),
        },
        categories: {
          set: categoryIds.map((categoryId) => ({ id: categoryId })),
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    return NextResponse.json({ book });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Book not found" },
          { status: 404 }
        );
      }

      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Book slug or ISBN already exists" },
          { status: 409 }
        );
      }
    }

    console.error("Book update failed:", error);

    return NextResponse.json(
      { error: "Unable to update book" },
      { status: 500 }
    );
  }
}