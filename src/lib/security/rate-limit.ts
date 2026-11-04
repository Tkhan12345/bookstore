import "server-only";

import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type RateLimitOptions = {
  scope: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

export async function checkRateLimit({
  scope,
  identifier,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<{
  allowed: boolean;
  retryAfterSeconds: number;
}> {
  if (
    !scope ||
    !identifier ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    !Number.isSafeInteger(windowSeconds) ||
    windowSeconds < 1
  ) {
    throw new Error("Invalid rate-limit configuration");
  }

  const key = createHash("sha256")
    .update(JSON.stringify([scope, identifier]))
    .digest("hex");

  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  // Atomic upsert: concurrent requests cannot bypass the counter.
  const rows = await prisma.$queryRaw<
    Array<{ count: number; expiresAt: Date }>
  >(Prisma.sql`
    INSERT INTO "RateLimitBucket"
      ("key", "count", "windowStart", "expiresAt")
    VALUES (${key}, 1, ${now}, ${expiresAt})
    ON CONFLICT ("key")
    DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now}
        THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now}
        THEN ${now}
        ELSE "RateLimitBucket"."windowStart"
      END,
      "expiresAt" = CASE
        WHEN "RateLimitBucket"."expiresAt" <= ${now}
        THEN ${expiresAt}
        ELSE "RateLimitBucket"."expiresAt"
      END
    RETURNING "count", "expiresAt"
  `);

  const bucket = rows[0];

  if (!bucket) {
    throw new Error("Rate-limit counter unavailable");
  }

  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds:
      bucket.count <= limit
        ? 0
        : Math.max(
            1,
            Math.ceil((bucket.expiresAt.getTime() - now.getTime()) / 1000),
          ),
  };
}

export async function resetRateLimit(
  scope: string,
  identifier: string,
): Promise<void> {
  if (!scope || !identifier) {
    throw new Error("Invalid rate-limit reset configuration");
  }

  const key = createHash("sha256")
    .update(JSON.stringify([scope, identifier]))
    .digest("hex");

  await prisma.rateLimitBucket.deleteMany({
    where: { key },
  });
}
