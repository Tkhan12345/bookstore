"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function BookCoverUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are supported.");
      event.target.value = "";
      return;
    }

    if (file.size === 0 || file.size > MAX_SIZE) {
      setError("Image must be between 1 byte and 5 MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await fetch("/api/v1/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      if (typeof data.url !== "string") {
        throw new Error("Invalid upload response.");
      }

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        Book Cover Image
      </label>

      {value && (
        
<Image
  src={value}
  alt="Book cover preview"
  width={128}
  height={176}
  unoptimized
  className="h-44 w-32 rounded-md border object-cover"
/>

      )}

      
<div className="rounded-xl border-2 border-dashed border-[#a8bba3] bg-[#f8f5ed] p-6 text-center">
  <div className="mb-3 text-3xl">📚</div>

  <p className="mb-1 text-sm font-semibold text-[#18392b]">
    Upload a book cover
  </p>

  <p className="mb-4 text-xs text-[#657267]">
    JPG, PNG or WebP · Maximum 5 MB
  </p>

  <input
    ref={inputRef}
    id="book-cover-upload"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    onChange={handleFile}
    disabled={uploading}
    className="sr-only"
  />

  <label
    htmlFor="book-cover-upload"
    aria-disabled={uploading}
    className={`inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#18392b] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#28513d] ${
      uploading ? "pointer-events-none opacity-50" : ""
    }`}
  >
    {uploading ? "Uploading..." : "Choose Cover Image"}
  </label>
</div>


      <p className="text-xs text-muted-foreground">
        JPG, PNG or WebP. Maximum 5 MB.
      </p>

      {uploading && (
        <p className="text-sm">Uploading image to Cloudinary...</p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium">
          Or paste an image URL
        </label>
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://example.com/cover.jpg"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
