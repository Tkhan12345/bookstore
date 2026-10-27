import { z } from "zod";
import { MAX_QUANTITY_PER_ORDER } from "@/lib/site-config";

/** The slice of a book the cart and wishlist need to render themselves. */
export const bookSnapshotSchema = z.object({
  bookId: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  author: z.string(),
  pricePaise: z.number().int().nonnegative(),
  compareAtPaise: z.number().int().nonnegative().nullable(),
  coverImage: z.string().nullable(),
});

export const cartItemSchema = bookSnapshotSchema.extend({
  quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ORDER),
  /** Highest quantity allowed when the item was last added (stock/limit). */
  maxQuantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ORDER),
});

export const cartSchema = z.array(cartItemSchema);
export const wishlistSchema = z.array(bookSnapshotSchema);

export type BookSnapshot = z.infer<typeof bookSnapshotSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;