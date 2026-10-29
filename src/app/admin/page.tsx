import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/" className="text-sm text-forest underline">
          Back to bookstore
        </Link>

        <div className="rounded-xl border border-border bg-card p-8">
          <p className="mb-2 text-sm font-medium text-forest">
            BookStore Administration
          </p>

          <h1 className="font-serif text-4xl font-semibold">
            Admin Dashboard
          </h1>

          <p className="mt-4 text-muted-foreground">
            Welcome, {admin.name}.
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Your administrator access has been verified.
          </p>
        </div>
      </div>
    </main>
  );
}
