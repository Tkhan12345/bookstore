import { parseJsonRequest } from "@/lib/security/parse-json";

import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

  if (!admin.user?.id) {
    return NextResponse.json(
      { error: "Administrator identity unavailable." },
      { status: 403 },
    );
  }

  const { id } = await context.params;

  let body: unknown;

  try {
    const result = await parseJsonRequest(request);
    if (!result.ok) return result.response;
    body = result.body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payment update." },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id },
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            totalPaise: true,
          },
        });

        if (!order) {
          return {
            error: "Order not found.",
            httpStatus: 404,
          };
        }

        if (
          order.status !== "DELIVERED" ||
          order.paymentStatus !== "PENDING"
        ) {
          return {
            error: "Order must be delivered and unpaid.",
            httpStatus: 409,
          };
        }

        const paidAt = new Date();

        const updated = await tx.order.updateMany({
          where: {
            id,
            status: "DELIVERED",
            paymentStatus: "PENDING",
          },
          data: {
            paymentStatus: "PAID",
            paidAt,
            paidByAdminId: admin.user.id,
          },
        });

        if (updated.count !== 1) {
          throw new Error("PAYMENT_CONFLICT");
        }

        const payment = await tx.payment.create({
          data: {
            orderId: id,
            provider: "COD",
            status: "PAID",
            amountPaise: order.totalPaise,
          },
        });

        return {
          orderId: id,
          paymentId: payment.id,
          paymentStatus: "PAID" as const,
          paidAt: paidAt.toISOString(),
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.httpStatus },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { error: "Payment conflict. Refresh and retry." },
        { status: 409 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "PAYMENT_CONFLICT"
    ) {
      return NextResponse.json(
        { error: "Payment already updated." },
        { status: 409 },
      );
    }

    console.error("COD payment recording failed:", error);

    return NextResponse.json(
      { error: "Unable to record payment." },
      { status: 500 },
    );
  }
}
