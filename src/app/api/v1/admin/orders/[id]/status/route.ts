import { NextResponse } from "next/server";
import { Prisma, type OrderStatus } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getAdminForApi } from "@/lib/auth/admin-api";

export const runtime = "nodejs";

const schema = z.object({
  status: z.enum([
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

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
      { error: "Invalid order status." },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const order = await tx.order.findUnique({
          where: { id },
          include: {
            items: {
              select: {
                bookId: true,
                quantity: true,
              },
            },
          },
        });

        if (!order) {
          return { error: "Order not found.", status: 404 };
        }

        const next = parsed.data.status;

        if (!transitions[order.status].includes(next)) {
          return {
            error: `Cannot change ${order.status} to ${next}.`,
            status: 409,
          };
        }

        const updated = await tx.order.updateMany({
          where: {
            id,
            status: order.status,
          },
          data: {
            status: next,
          },
        });

        if (updated.count !== 1) {
          throw new Error("ORDER_CONFLICT");
        }

        if (next === "CANCELLED") {
          for (const item of order.items) {
            await tx.inventory.update({
              where: { bookId: item.bookId },
              data: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });
          }
        }

        return { orderId: id, status: next };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    );

    if ("error" in result && typeof result.status === "number") {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { error: "Order changed. Refresh and retry." },
        { status: 409 },
      );
    }

    if (error instanceof Error && error.message === "ORDER_CONFLICT") {
      return NextResponse.json(
        { error: "Order changed. Refresh and retry." },
        { status: 409 },
      );
    }

    console.error("Order status update failed:", error);

    return NextResponse.json(
      { error: "Unable to update order." },
      { status: 500 },
    );
  }
}