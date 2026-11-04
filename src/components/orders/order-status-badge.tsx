import type { OrderStatus } from "@prisma/client";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}