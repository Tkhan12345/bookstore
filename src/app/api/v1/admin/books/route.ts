import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { getAdminForApi } from "@/lib/auth/admin-api";
import { prisma } from "@/lib/prisma";
import { createBookSchema } from "@/lib/validation/book";

export async function POST(request: Request) {
  const admin = await getAdminForApi();

  if (admin.error) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.error === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = createBookSchema.safeParse(body);

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

    const book = await prisma.book.create({
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
          connect: authorIds.map((id) => ({ id })),
        },
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
        inventory: {
          create: {
            quantity: data.quantity,
          },
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Book slug or ISBN already exists" },
        { status: 409 }
      );
    }

    console.error("Book creation failed:", error);

    return NextResponse.json(
      { error: "Unable to create book" },
      { status: 500 }
    );
  }
}
