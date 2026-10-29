import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/auth/admin-api";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function authError(error: string) {
  return NextResponse.json(
    { error },
    { status: error === "UNAUTHENTICATED" ? 401 : 403 }
  );
}

export async function GET() {
  const admin = await getAdminForApi();

  if (admin.error) return authError(admin.error);

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { books: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Fetch categories failed:", error);

    return NextResponse.json(
      { error: "Unable to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await getAdminForApi();

  if (admin.error) return authError(admin.error);

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = categorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Category name must contain 2–100 characters" },
      { status: 400 }
    );
  }

  const name = parsed.data.name;
  const slug = slugify(name);

  if (!slug) {
    return NextResponse.json(
      { error: "Category name must produce a valid slug" },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.create({
      data: { name, slug },
    });

    return NextResponse.json(
      { success: true, data: category },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This category already exists" },
        { status: 409 }
      );
    }

    console.error("Create category failed:", error);

    return NextResponse.json(
      { error: "Unable to create category" },
      { status: 500 }
    );
  }
}
