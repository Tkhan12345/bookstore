import type { ToastInput } from "@/components/shared/toast-provider";
import type { AddToCartResult } from "@/hooks/use-cart";

export function describeAddResult(
  result: AddToCartResult,
  title: string,
  quantity: number,
): ToastInput {
  const viewCart = { label: "View cart", href: "/cart" };

  switch (result.status) {
    case "added":
      return {
        title: "Added to cart",
        description: `${quantity} × ${title}`,
        action: viewCart,
      };
    case "capped":
      return {
        title: "Cart updated",
        description: `Only ${result.quantity} copies of ${title} can be in your cart.`,
        action: viewCart,
      };
    case "at-limit":
      return {
        title: "Already at the limit",
        description: `You have all ${result.quantity} available copies in your cart.`,
        tone: "error",
        action: viewCart,
      };
    case "unavailable":
      return {
        title: "Out of stock",
        description: "This book can't be added right now.",
        tone: "error",
      };
  }
}