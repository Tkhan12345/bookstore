"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Option = {
  id: string;
  name: string;
};

type BookData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  isbn: string;
  pricePaise: number;
  coverImage: string;
  authorIds: string[];
  categoryIds: string[];
  featured: boolean;
  active: boolean;
};

type Props = {
  book: BookData;
  authors: Option[];
  categories: Option[];
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-[#18392b]";

export function EditBookForm({ book, authors, categories }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(book.title);
  const [slug, setSlug] = useState(book.slug);
  const [description, setDescription] = useState(book.description);
  const [isbn, setIsbn] = useState(book.isbn);
  const [price, setPrice] = useState((book.pricePaise / 100).toFixed(2));
  const [coverImage, setCoverImage] = useState(book.coverImage);
  const [authorId, setAuthorId] = useState(book.authorIds[0] ?? "");
  const [categoryId, setCategoryId] = useState(book.categoryIds[0] ?? "");
  const [featured, setFeatured] = useState(book.featured);
  const [active, setActive] = useState(book.active);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");

    const priceValue = Number(price);
    const pricePaise = Math.round(priceValue * 100);

    if (!Number.isFinite(priceValue) || priceValue <= 0 || !Number.isSafeInteger(pricePaise)) {
      setError("Enter a valid price.");
      return;
    }

    if (!authorId || !categoryId) {
      setError("Select an author and category.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/v1/admin/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          isbn,
          pricePaise,
          coverImage,
          authorIds: [authorId],
          categoryIds: [categoryId],
          featured,
          active,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to update book.");
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
        <label htmlFor="edit-title" className="mb-2 block text-sm font-medium">
          Book Title *
        </label>
        <input id="edit-title" required minLength={2} maxLength={200}
          value={title} onChange={(e) => setTitle(e.target.value)}
          className={inputClass} />
      </div>

      <div>
        <label htmlFor="edit-slug" className="mb-2 block text-sm font-medium">
          URL Slug *
        </label>
        <input id="edit-slug" required value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={inputClass} />
      </div>

      <div>
        <label htmlFor="edit-description" className="mb-2 block text-sm font-medium">
          Description *
        </label>
        <textarea id="edit-description" required minLength={10} rows={5}
          value={description} onChange={(e) => setDescription(e.target.value)}
          className={inputClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-isbn" className="mb-2 block text-sm font-medium">
            ISBN (optional)
          </label>
          <input id="edit-isbn" value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            className={inputClass} />
        </div>

        <div>
          <label htmlFor="edit-price" className="mb-2 block text-sm font-medium">
            Price (INR) *
          </label>
          <input id="edit-price" type="number" min="0.01" step="0.01" required
            value={price} onChange={(e) => setPrice(e.target.value)}
            className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="edit-cover" className="mb-2 block text-sm font-medium">
          Cover Image URL
        </label>
        <input id="edit-cover" type="url" value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          className={inputClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-author" className="mb-2 block text-sm font-medium">
            Author *
          </label>
          <select id="edit-author" required value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className={inputClass}>
            <option value="">Select author</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="edit-category" className="mb-2 block text-sm font-medium">
            Category *
          </label>
          <select id="edit-category" required value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={featured}
            onChange={(e) => setFeatured(e.target.checked)} />
          Featured Book
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={active}
            onChange={(e) => setActive(e.target.checked)} />
          Active (visible in catalogue)
        </label>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <button type="submit" disabled={loading}
          className="rounded-lg bg-[#18392b] px-6 py-3 text-sm font-medium text-white disabled:opacity-50">
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>

        <Link href="/admin/books"
          className="rounded-lg border border-border px-6 py-3 text-sm font-medium">
          Cancel
        </Link>
      </div>
    </form>
  );
}
