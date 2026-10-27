"use server";

import { z } from "zod";
import { getBookLiveStatuses } from "./catalog.service";
import type { BookLiveStatus } from "./catalog.types";

const idsSchema = z.array(z.string().min(1).max(64)).max(50);

/** Read-only. Used by the cart and wishlist to verify price and stock. */
export async function fetchBookLiveStatuses(
  ids: string[],
): Promise<BookLiveStatus[]> {
  const parsed = idsSchema.safeParse(ids);
  if (!parsed.success) return [];
  return getBookLiveStatuses([...new Set(parsed.data)]);
}