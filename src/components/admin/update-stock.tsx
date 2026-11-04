"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

type Props = {
  bookId: string;
  bookTitle: string;
  currentQuantity: number;
  reservedQuantity: number;
};

export function UpdateStock({
  bookId,
  bookTitle,
  currentQuantity,
  reservedQuantity,
}: Props) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(String(currentQuantity));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError("");

    const value = Number(quantity);

    if (!Number.isInteger(value) || value < 0 || value > 100000) {
      setError("Enter a whole number between 0 and 100000.");
      return;
    }

    if (value < reservedQuantity) {
      setError(`At least ${reservedQuantity} copies are reserved.`);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/v1/admin/inventory/${encodeURIComponent(bookId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: value }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to update stock.");
        return;
      }

      setEditing(false);
      router.refresh();
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setQuantity(String(currentQuantity));
          setError("");
          setEditing(true);
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary"
        aria-label={`Update stock for ${bookTitle}`}
      >
        <Pencil className="size-3.5" />
        Update
      </button>
    );
  }

  return (
    <form onSubmit={handleSave} className="min-w-44 space-y-2">
      <label className="block text-xs font-medium" htmlFor={`stock-${bookId}`}>
        Total stock
      </label>

      <input
        id={`stock-${bookId}`}
        type="number"
        min={reservedQuantity}
        max={100000}
        step={1}
        required
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />

      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#18392b] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setEditing(false);
            setError("");
          }}
          className="rounded-lg border border-border px-3 py-2 text-xs"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
