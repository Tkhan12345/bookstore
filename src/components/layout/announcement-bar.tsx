import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/site-config";

export function AnnouncementBar() {
  const message =
    FREE_SHIPPING_THRESHOLD_PAISE === null
      ? "Books worth keeping, chosen with care."
      : `Free shipping on orders above ${formatPrice(FREE_SHIPPING_THRESHOLD_PAISE)}`;

  return (
    <div className="bg-forest text-cream">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium tracking-wider sm:text-sm">
        {message}
      </p>
    </div>
  );
}