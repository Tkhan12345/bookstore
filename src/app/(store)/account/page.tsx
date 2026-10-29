import Link from "next/link";

import { redirect } from "next/navigation";
import { BookOpen, Mail, ShieldCheck, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <section className="mx-auto min-h-[70vh] max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-gold">
          Your reading space
        </p>

        <h1 className="font-heading text-4xl font-semibold text-forest">
          My Account
        </h1>

        <p className="mt-3 text-muted-foreground">
          Manage your BookStore profile and reading journey.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-7 md:col-span-2">
          <div className="mb-7 flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <UserRound className="size-7 text-forest" />
            </div>

            <div>
              <h2 className="font-heading text-2xl font-semibold text-forest">
                {user.name || "BookStore Reader"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Account information
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 size-5 text-forest" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Email address
                </p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 size-5 text-forest" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Account role
                </p>
                <p className="font-medium">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="mb-4 inline-flex items-center justify-center rounded-lg bg-forest px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Go to Admin Dashboard
              </Link>
            )}

            <div>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-7">
          <BookOpen className="mb-5 size-8 text-gold" />

          <h2 className="font-heading text-xl font-semibold text-forest">
            Your BookStore
          </h2>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your orders, saved books and delivery addresses
            will be available here as we complete the
            customer dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}
