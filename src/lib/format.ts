const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrFractional = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats an integer paise amount as INR, e.g. 49900 -> ₹499. */
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return paise % 100 === 0
    ? inrWhole.format(rupees)
    : inrFractional.format(rupees);
}

/** Whole-number discount percentage, or null when there is no real discount. */
export function getDiscountPercent(
  pricePaise: number,
  compareAtPaise: number | null | undefined,
): number | null {
  if (!compareAtPaise || compareAtPaise <= pricePaise) return null;
  return Math.round(((compareAtPaise - pricePaise) / compareAtPaise) * 100);
}

type InventoryLike = {
  quantity: number;
  reservedQuantity: number;
} | null;

export type Availability = {
  available: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  label: string;
};

export const LOW_STOCK_THRESHOLD = 5;

/** Single source of truth for stock status across the storefront. */
export function getAvailability(inventory: InventoryLike): Availability {
  const available = inventory
    ? Math.max(0, inventory.quantity - inventory.reservedQuantity)
    : 0;

  if (available === 0) {
    return { available, status: "out-of-stock", label: "Out of stock" };
  }
  if (available <= LOW_STOCK_THRESHOLD) {
    return { available, status: "low-stock", label: `Only ${available} left` };
  }
  return { available, status: "in-stock", label: "In stock" };
}