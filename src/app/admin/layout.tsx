import type { ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
