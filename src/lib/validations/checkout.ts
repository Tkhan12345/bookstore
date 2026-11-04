import { z } from "zod";
import { INDIAN_STATES } from "@/lib/india-states";

export const shippingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(80, "Use 80 characters or fewer."),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+91[\s-]?|0)?[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian mobile number.",
    ),
  line1: z
    .string()
    .trim()
    .min(5, "Enter your house number and street.")
    .max(120, "Use 120 characters or fewer."),
  line2: z.string().trim().max(120, "Use 120 characters or fewer."),
  city: z
    .string()
    .trim()
    .min(2, "Enter your city or town.")
    .max(60, "Use 60 characters or fewer."),
  state: z
    .string()
    .refine(
      (value) => (INDIAN_STATES as readonly string[]).includes(value),
      "Select a state or union territory.",
    ),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit PIN code."),
});

export type ShippingValues = z.infer<typeof shippingSchema>;
export type ShippingField = keyof ShippingValues;

/** Order used for validation focus and rendering. */
export const SHIPPING_FIELDS = [
  "fullName",
  "phone",
  "line1",
  "line2",
  "city",
  "state",
  "postalCode",
] as const satisfies readonly ShippingField[];

export type FieldErrors = Partial<Record<ShippingField, string>>;

function isShippingField(key: unknown): key is ShippingField {
  return (
    typeof key === "string" && (SHIPPING_FIELDS as readonly string[]).includes(key)
  );
}

export function validateShipping(values: ShippingValues): FieldErrors {
  const result = shippingSchema.safeParse(values);
  if (result.success) return {};

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (isShippingField(key) && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export const PAYMENT_METHODS = ["razorpay", "cod"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];