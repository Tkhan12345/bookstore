"use client";

import { BookCoverUploader } from "@/components/admin/book-cover-uploader";

import { BookTaxonomySelector } from "@/components/admin/book-taxonomy-selector";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Option = {
  id: string;
  name: string;
};

type NewBookFormProps = {
  authors: Option[];
  categories: Option[];
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function NewBookForm({
  authors,
  categories,
}: NewBookFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [authorIds, setAuthorIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("0");
  const [featured, setFeatured] = useState(false);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");

    const priceValue = Number(price);
    const quantityValue = Number(quantity);
    const pricePaise = Math.round(priceValue * 100);

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    if (!Number.isSafeInteger(pricePaise)) {
      setError("Price is outside the supported range.");
      return;
    }

    if (!Number.isInteger(quantityValue) || quantityValue < 0) {
      setError("Enter a valid stock quantity.");
      return;
    }

    if (authorIds.length === 0 || categoryIds.length === 0) {
      setError("Please select an author and category.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          isbn,
          pricePaise,
          coverImage,
          authorIds,
          categoryIds,
          quantity: quantityValue,
          featured,
          active,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to create book.");
        return;
      }

      router.push("/admin/books");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-forest";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="book-title" className="mb-2 block text-sm font-medium">
          Book Title *
        </label>
        <input
          id="book-title"
          required
          minLength={2}
          maxLength={200}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSlug(makeSlug(e.target.value));
          }}
          className={inputClass}
          placeholder="Enter book title"
        />
      </div>

      <div>
        <label htmlFor="book-slug" className="mb-2 block text-sm font-medium">
          URL Slug *
        </label>
        <input
          id="book-slug"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={inputClass}
          placeholder="book-title"
        />
      </div>

      <div>
        <label htmlFor="book-description" className="mb-2 block text-sm font-medium">
          Description *
        </label>
        <textarea
          id="book-description"
          required
          minLength={10}
          maxLength={10000}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="Describe the book..."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="book-isbn" className="mb-2 block text-sm font-medium">
            ISBN (optional)
          </label>
          <input
            id="book-isbn"
            maxLength={20}
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="book-price" className="mb-2 block text-sm font-medium">
            Price (INR) *
          </label>
          <input
            id="book-price"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputClass}
            placeholder="499.00"
          />
        </div>
      </div>

      <BookCoverUploader value={coverImage} onChange={setCoverImage} />

      <div className="grid gap-5 sm:grid-cols-2">
        <BookTaxonomySelector
          type="authors"
          initialOptions={authors}
          selectedIds={authorIds}
          onChange={setAuthorIds}
        />
        <BookTaxonomySelector
          type="categories"
          initialOptions={categories}
          selectedIds={categoryIds}
          onChange={setCategoryIds}
        />
      </div>

      <div>
        <label htmlFor="book-quantity" className="mb-2 block text-sm font-medium">
          Initial Stock Quantity *
        </label>
        <input
          id="book-quantity"
          type="number"
          min="0"
          max="100000"
          step="1"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Feature this book on the storefront
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Active (visible in catalogue)
        </label>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={loading || authorIds.length === 0 || categoryIds.length === 0}
          className="rounded-lg bg-forest px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Create Book"}
        </button>

        <Link
          href="/admin/books"
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium"
        >
          Cancel
        </Link>
      </div>

      
    </form>
  );
}

