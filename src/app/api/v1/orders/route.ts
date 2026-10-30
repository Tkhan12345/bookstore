import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MAX_QUANTITY_PER_ORDER } from "@/lib/site-config";
import { shippingSchema } from "@/lib/validations/checkout";

export const runtime = "nodejs";

const itemSchema = z.object({
  bookId: z.string().cuid(),
  quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ORDER),
  expectedPricePaise: z.number().int().nonnegative(),
});

const orderSchema = z.object({
  idempotencyKey: z.string().uuid(),
  paymentMethod: z.literal("cod"),
  shipping: shippingSchema,
  items: z.array(itemSchema).min(1).max(50),
});

class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

function failure(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isPrismaError(error: unknown, code: string) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === code
  );
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return failure("Please sign in before placing an order.", 401);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return failure("Invalid JSON request.", 400);
  }

  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid checkout details.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const { idempotencyKey, shipping, items } = parsed.data;

  if (new Set(items.map((item) => item.bookId)).size !== items.length) {
    return failure("Duplicate books in checkout.", 400);
  }

  const sortedItems = [...items].sort((a, b) =>
    a.bookId.localeCompare(b.bookId),
  );

  const requestHash = createHash("sha256")
    .update(
      JSON.stringify({
        userId,
        paymentMethod: "cod",
        shipping,
        items: sortedItems,
      }),
    )
    .digest("hex");

  const select = {
    id: true,
    userId: true,
    requestHash: true,
    totalPaise: true,
    status: true,
  } as const;

  async function replayExisting() {
    const existing = await prisma.order.findUnique({
      where: { idempotencyKey },
      select,
    });

    if (!existing) return null;

    if (
      existing.userId !== userId ||
      existing.requestHash !== requestHash
    ) {
      return failure(
        "This checkout attempt was already used for different details.",
        409,
      );
    }

    return NextResponse.json({
      order: {
        id: existing.id,
        totalPaise: existing.totalPaise,
        status: existing.status,
      },
      replayed: true,
    });
  }

  const replay = await replayExisting();
  if (replay) return replay;

  try {
    const order = await prisma.$transaction(
      async (tx) => {
        const books = await tx.book.findMany({
          where: {
            id: { in: sortedItems.map((item) => item.bookId) },
            active: true,
          },
          select: {
            id: true,
            title: true,
            pricePaise: true,
          },
        });

        if (books.length !== sortedItems.length) {
          throw new CheckoutError(
            "One or more books are no longer available.",
            409,
          );
        }

        const bookMap = new Map(books.map((book) => [book.id, book]));
        let subtotalPaise = 0;

        for (const item of sortedItems) {
          const book = bookMap.get(item.bookId)!;

          if (book.pricePaise !== item.expectedPricePaise) {
            throw new CheckoutError(
              `Price changed for "${book.title}". Refresh your cart.`,
              409,
            );
          }

          const updated = await tx.inventory.updateMany({
            where: {
              bookId: item.bookId,
              quantity: { gte: item.quantity },
            },
            data: {
              quantity: { decrement: item.quantity },
            },
          });

          if (updated.count !== 1) {
            throw new CheckoutError(
              `Insufficient stock for "${book.title}".`,
              409,
            );
          }

          subtotalPaise += book.pricePaise * item.quantity;
        }

        return tx.order.create({
          data: {
            userId,
            idempotencyKey,
            requestHash,
            status: "CONFIRMED",
            paymentStatus: "PENDING",
            subtotalPaise,
            shippingPaise: 0,
            totalPaise: subtotalPaise,
            shippingName: shipping.fullName,
            shippingPhone: shipping.phone,
            shippingLine1: shipping.line1,
            shippingLine2: shipping.line2 || null,
            shippingCity: shipping.city,
            shippingState: shipping.state,
            shippingPostal: shipping.postalCode,
            shippingCountry: "IN",
            items: {
              create: sortedItems.map((item) => {
                const book = bookMap.get(item.bookId)!;

                return {
                  bookId: item.bookId,
                  titleSnapshot: book.title,
                  pricePaise: book.pricePaise,
                  quantity: item.quantity,
                };
              }),
            },
          },
          select: {
            id: true,
            totalPaise: true,
            status: true,
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    );

    return NextResponse.json(
      { order, replayed: false },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof CheckoutError) {
      return failure(error.message, error.status);
    }

    if (isPrismaError(error, "P2002")) {
      const existing = await replayExisting();
      if (existing) return existing;

      return failure("Checkout conflict. Please retry.", 409);
    }

    if (isPrismaError(error, "P2034")) {
      return failure(
        "Inventory changed during checkout. Please try again.",
        409,
      );
    }

    console.error("Order creation failed:", error);
    return failure("Unable to place order. Please try again.", 500);
  }
}