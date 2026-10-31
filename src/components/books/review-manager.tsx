"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";

type OwnReview = { id: string; rating: number; comment: string | null } | null;
type Props = { bookId: string; signedIn: boolean; purchased: boolean; existing: OwnReview };

export function ReviewManager({ bookId, signedIn, purchased, existing }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit() {
    setBusy(true); setError(""); setMessage("");
    try {
      const url = existing ? `/api/v1/reviews/${existing.id}` : `/api/v1/books/${bookId}/reviews`;
      const response = await fetch(url, {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save review");
      setMessage("Review saved successfully.");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!existing || !window.confirm("Delete your review?")) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/v1/reviews/${existing.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete review");
      setMessage("Review deleted.");
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setBusy(false); }
  }

  if (!signedIn) return <p className="mt-5 text-sm text-muted-foreground"><Link className="font-semibold text-forest underline" href="/login">Sign in</Link> to review a book you purchased.</p>;
  if (!purchased && !existing) return <p className="mt-5 text-sm text-muted-foreground">Only customers who purchased this book can leave a verified review.</p>;

  return (
    <div className="mt-8 rounded-xl border bg-white p-5 sm:p-6">
      <h3 className="font-heading text-xl font-semibold text-forest">{existing ? "Edit your review" : "Write a verified review"}</h3>
      <p className="mt-1 text-xs text-muted-foreground">Verified purchase · One review per book</p>
      <div className="mt-4 flex gap-1" role="group" aria-label="Your rating">
        {[1,2,3,4,5].map((value) => (
          <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`} aria-pressed={rating === value} className="rounded p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">
            <Star className={`size-7 ${value <= rating ? "fill-amber-400 text-amber-500" : "text-gray-300"}`} />
          </button>
        ))}
      </div>
      <label htmlFor="review-comment" className="mt-4 block text-sm font-medium">Your thoughts (optional)</label>
      <textarea id="review-comment" maxLength={2000} rows={4} value={comment} onChange={(e) => setComment(e.target.value)} className="mt-2 w-full rounded-md border p-3 text-sm" placeholder="What did you think of this book?" />
      <p className="text-right text-xs text-muted-foreground">{comment.length}/2000</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-2 text-sm text-green-700">{message}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={submit} className="rounded-md bg-[#18392b] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving..." : existing ? "Update review" : "Publish review"}</button>
        {existing && <button type="button" disabled={busy} onClick={remove} className="rounded-md border px-5 py-2 text-sm font-medium text-red-700 disabled:opacity-50">Delete review</button>}
      </div>
    </div>
  );
}
