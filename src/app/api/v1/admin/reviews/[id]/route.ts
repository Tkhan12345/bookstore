import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/auth/admin-api";

export const runtime = "nodejs";
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminForApi();
  if (admin.error) return NextResponse.json({ error: "Forbidden" }, { status: admin.error === "UNAUTHENTICATED" ? 401 : 403 });
  const { id } = await params;
  const result = await prisma.review.deleteMany({ where: { id } });
  if (!result.count) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
