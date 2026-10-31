import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/review";

export const runtime = "nodejs";
type Context = { params: Promise<{ bookId: string }> };

export async function POST(request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const { bookId } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Rating must be 1–5; review up to 2000 characters" }, { status: 400 });
  const book = await prisma.book.findFirst({ where: { id: bookId, active: true }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });
  const purchased = await prisma.orderItem.findFirst({
    where: { bookId, order: { userId: session.user.id, status: { not: "CANCELLED" } } },
    select: { id: true },
  });
  if (!purchased) return NextResponse.json({ error: "Only customers who purchased this book can review it" }, { status: 403 });
  try {
    const review = await prisma.review.create({ data: {
      userId: session.user.id, bookId, rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    } });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "You already reviewed this book; edit your existing review" }, { status: 409 });
    }
    throw error;
  }
}
