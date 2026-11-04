"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";

type Item = {
  id: string;
  name: string;
  slug: string;
  _count: { books: number };
};

type Props = {
  type: "authors" | "categories";
};

export function TaxonomyManager({ type }: Props) {
  const router = useRouter();
  const isAuthor = type === "authors";
  const label = isAuthor ? "Author" : "Category";

  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadItems() {
    setLoading(true);

    try {
      const response = await fetch(`/api/v1/admin/${type}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to load records");
      }

      setItems(result.data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load records"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(`/api/v1/admin/${type}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load records");
        }

        if (active) setItems(result.data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load records"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [type]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/v1/admin/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isAuthor ? { name, bio } : { name }
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create record");
      }

      setName("");
      setBio("");
      setSuccess(`${label} added successfully.`);
      await loadItems();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save record"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {isAuthor ? "Authors" : "Categories"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your bookstore {type} and their book associations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="h-fit space-y-4 rounded-xl border bg-card p-6"
        >
          <h2 className="text-lg font-semibold">Add New {label}</h2>

          <div className="space-y-2">
            <label htmlFor={`${type}-name`} className="text-sm font-medium">
              {label} Name
            </label>

            <input
              id={`${type}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={isAuthor ? "e.g. Andrew Hunt" : "e.g. Fiction"}
              minLength={2}
              maxLength={isAuthor ? 120 : 100}
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          {isAuthor && (
            <div className="space-y-2">
              <label htmlFor="author-bio" className="text-sm font-medium">
                Biography (optional)
              </label>

              <textarea
                id="author-bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={3000}
                rows={4}
                placeholder="Short author biography..."
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">{error}</p>
          )}

          {success && (
            <p role="status" className="text-sm text-green-700">{success}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#18392b] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            {saving ? "Saving..." : `Add ${label}`}
          </button>
        </form>

        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="border-b p-5">
            <h2 className="font-semibold">
              Existing {isAuthor ? "Authors" : "Categories"} ({items.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No {type} found.
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      /{item.slug}
                    </p>
                  </div>

                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {item._count.books} books
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
