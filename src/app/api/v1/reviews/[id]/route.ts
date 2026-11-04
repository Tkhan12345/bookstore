import { parseJsonRequest } from "@/lib/security/parse-json";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/review";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const { id } = await params;
  let body: unknown;
  try {
    const result = await parseJsonRequest(request);
    if (!result.ok) return result.response;
    body = result.body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  const result = await prisma.review.updateMany({
    where: { id, userId: session.user.id },
    data: { rating: parsed.data.rating, comment: parsed.data.comment || null },
  });
  if (!result.count) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const { id } = await params;
  const result = await prisma.review.deleteMany({ where: { id, userId: session.user.id } });
  if (!result.count) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
