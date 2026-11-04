import { z } from "zod";

export const createBookSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(10000),
  isbn: z.string().trim().max(20).optional(),
  pricePaise: z.number().int().positive().safe(),
  coverImage: z.string().trim().url().optional().or(z.literal("")),
  authorIds: z.array(z.string().min(1)).min(1),
  categoryIds: z.array(z.string().min(1)).min(1),
  quantity: z.number().int().min(0).max(100000),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;

export const updateBookSchema = createBookSchema
  .omit({ quantity: true })
  .extend({
    authorIds: z.array(z.string().min(1)).min(1),
    categoryIds: z.array(z.string().min(1)).min(1),
  });

export type UpdateBookInput = z.infer<typeof updateBookSchema>;
