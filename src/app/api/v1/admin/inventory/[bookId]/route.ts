import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminForApi } from "@/lib/auth/admin-api";
import { prisma } from "@/lib/prisma";

const updateStockSchema = z.object({
  quantity: z.number().int().min(0).max(100000),
});

type RouteContext = {
  params: Promise<{ bookId: string }>;
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

  const { bookId } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = updateStockSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Quantity must be an integer between 0 and 100000" },
      { status: 400 }
    );
  }

  const { quantity } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const book = await tx.book.findUnique({
        where: { id: bookId },
        select: { id: true },
      });

      if (!book) {
        return { status: 404 as const, error: "Book not found" };
      }

      const inventory = await tx.inventory.findUnique({
        where: { bookId },
      });

      if (!inventory) {
        const created = await tx.inventory.create({
          data: { bookId, quantity },
        });

        return { status: 200 as const, inventory: created };
      }

      const updated = await tx.inventory.updateMany({
        where: {
          bookId,
          reservedQuantity: { lte: quantity },
        },
        data: { quantity },
      });

      if (updated.count === 0) {
        return {
          status: 409 as const,
          error: "Quantity cannot be less than reserved stock",
        };
      }

      const refreshed = await tx.inventory.findUniqueOrThrow({
        where: { bookId },
      });

      return { status: 200 as const, inventory: refreshed };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json({ inventory: result.inventory });
  } catch (error) {
    console.error("Inventory update failed:", error);

    return NextResponse.json(
      { error: "Unable to update inventory" },
      { status: 500 }
    );
  }
}