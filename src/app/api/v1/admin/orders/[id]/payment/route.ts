import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/auth/admin-api";

export const runtime = "nodejs";

const schema = z.object({
  paymentStatus: z.literal("PAID"),
}).strict();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminForApi();

  if (admin.error) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.error === "UNAUTHENTICATED" ? 401 : 403 },
    );
  }

  const { id } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON." },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payment update." },
      { status: 400 },
    );
  }

  const result = await prisma.order.updateMany({
    where: {
      id,
      status: "DELIVERED",
      paymentStatus: "PENDING",
    },
    data: {
      paymentStatus: "PAID",
    },
  });

  if (result.count !== 1) {
    return NextResponse.json(
      {
        error:
          "Payment cannot be recorded. The order must be delivered and unpaid.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    orderId: id,
    paymentStatus: "PAID",
  });
}