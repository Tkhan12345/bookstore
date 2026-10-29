import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/auth/admin-api";

const createAuthorSchema = z.object({
  name: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(3000).optional(),
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

  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { books: true },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: authors,
  });
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

  const parsed = createAuthorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid author information",
        details: z.flattenError(parsed.error),
      },
      { status: 400 }
    );
  }

  const { name, bio } = parsed.data;
  const slug = slugify(name);

  if (!slug) {
    return NextResponse.json(
      { error: "Author name must produce a valid slug" },
      { status: 400 }
    );
  }

  try {
    const author = await prisma.author.create({
      data: {
        name,
        slug,
        bio: bio || null,
      },
    });

    return NextResponse.json(
      { success: true, data: author },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An author with this name already exists" },
        { status: 409 }
      );
    }

    console.error("Create author failed:", error);

    return NextResponse.json(
      { error: "Unable to create author" },
      { status: 500 }
    );
  }
}
