"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function ReviewDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    if (!window.confirm("Permanently delete this review?")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/v1/admin/reviews/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Deletion failed");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setBusy(false); }
  }
  return <div><button type="button" disabled={busy} onClick={remove} className="rounded border px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-50">{busy ? "Deleting..." : "Remove"}</button>{error && <p role="alert" className="text-xs text-red-700">{error}</p>}</div>;
}
