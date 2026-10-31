import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{10,16}$/, "Enter a valid phone number"),
  line1: z.string().trim().min(5).max(200),
  line2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(/^[0-9]{6}$/, "Enter a 6-digit PIN code"),
});

export const profileSchema = z.object({name: z.string().trim().min(2).max(100)});
export const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
}).refine(v => v.currentPassword !== v.newPassword, {message:"Choose a different password", path:["newPassword"]});
