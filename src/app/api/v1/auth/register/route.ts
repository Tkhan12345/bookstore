
import { NextResponse } from "next/server";
import { readJsonWithLimit, RequestBodyError } from "@/lib/security/read-json";
import { hash } from "argon2";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await readJsonWithLimit(request);
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    throw error;
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration details" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const result = await checkRateLimit({
      scope: "register",
      identifier: email,
      limit: 5,
      windowSeconds: 3600,
    });

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSeconds) },
        },
      );
    }
  } catch (error) {
    console.error("Registration rate limiter unavailable:", error);
    return NextResponse.json(
      { error: "Registration temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const passwordHash = await hash(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    console.error("Registration failed:", error);

    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 }
    );
  }
}
