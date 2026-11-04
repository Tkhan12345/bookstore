import { AlertTriangle, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function InventoryOverview() {
  const inventory = await prisma.inventory.findMany({
    where: {
      book: { active: true },
    },
    include: {
      book: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
    orderBy: {
      quantity: "asc",
    },
  });

  const lowStock = inventory
    .map((item) => ({
      ...item,
      available: item.quantity - item.reservedQuantity,
    }))
    .filter((item) => item.available <= 5)
    .sort((a, b) => a.available - b.available);

  return (
    <section className="rounded-xl border border-border bg-card p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg bg-secondary text-forest">
          <Package className="size-5" />
        </div>

        <div>
          <h2 className="font-serif text-2xl font-semibold">
            Inventory Monitoring
          </h2>
          <p className="text-sm text-muted-foreground">
            Books with 5 or fewer available copies
          </p>
        </div>
      </div>

      {lowStock.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No low-stock inventory alerts.
        </p>
      ) : (
        <div className="space-y-3">
          {lowStock.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-medium">{item.book.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} total · {item.reservedQuantity} reserved
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="size-4 text-amber-600" />
                {item.available} available
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
