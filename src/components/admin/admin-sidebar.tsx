"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  ArrowLeft,
} from "lucide-react";

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Books", href: "/admin/books", icon: BookOpen },
  { label: "Inventory", href: "/admin/inventory", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 border-b border-border bg-card lg:min-h-screen lg:w-64 lg:border-r lg:border-b-0">
      <div className="border-b border-border px-6 py-6">
        <Link href="/admin" className="font-serif text-2xl font-semibold text-forest">
          BookStore<span className="text-amber-600">.</span>
        </Link>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
          Administration
        </p>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-secondary text-forest"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground hover:bg-secondary"
        >
          <ArrowLeft className="size-4" />
          Back to bookstore
        </Link>
      </div>
    </aside>
  );
}
