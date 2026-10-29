"use client";

import { useState } from "react";

type Option = { id: string; name: string };

type Props = {
  type: "authors" | "categories";
  initialOptions: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function BookTaxonomySelector({
  type,
  initialOptions,
  selectedIds,
  onChange,
}: Props) {
  const [options, setOptions] = useState(initialOptions);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAuthor = type === "authors";
  const label = isAuthor ? "Author" : "Category";

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((value) => value !== id)
        : [...selectedIds, id]
    );
  }

  async function addNew() {
    if (saving || !name.trim()) return;

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/admin/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? `Unable to add ${label.toLowerCase()}`);
      }

      const created: Option = result.data;

      setOptions((previous) =>
        [...previous, created].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      onChange([...new Set([...selectedIds, created.id])]);
      setName("");
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <fieldset className="space-y-3 rounded-xl border border-border p-4">
      <legend className="px-2 text-sm font-semibold">
        {isAuthor ? "Authors" : "Categories"} *
      </legend>

      <p className="text-xs text-muted-foreground">
        Select one or more {type}.
      </p>

      <div className="max-h-48 space-y-2 overflow-y-auto">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-secondary"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(option.id)}
              onChange={() => toggle(option.id)}
              className="size-4 accent-[#18392b]"
            />
            <span>{option.name}</span>
          </label>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} selected
        </p>
      )}

      {showAdd ? (
        <div className="space-y-2 rounded-lg bg-secondary/40 p-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={`New ${label.toLowerCase()} name`}
            maxLength={isAuthor ? 120 : 100}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />

          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving || name.trim().length < 2}
              onClick={addNew}
              className="rounded-lg bg-[#18392b] px-3 py-2 text-xs text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : `Save ${label}`}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setShowAdd(false);
                setError("");
                setName("");
              }}
              className="rounded-lg border px-3 py-2 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary"
        >
          + Add New {label}
        </button>
      )}
    </fieldset>
  );
}
