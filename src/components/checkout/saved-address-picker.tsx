"use client";

import { useEffect, useState } from "react";
import { INDIAN_STATES } from "@/lib/india-states";
import type { ShippingValues } from "@/lib/validations/checkout";

type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
};

function normalizeState(value: string, postalCode: string): string {
  const cleaned = (value ?? "").trim().toLowerCase();

  const match = INDIAN_STATES.find(
    (state) => state.toLowerCase() === cleaned,
  );

  if (match) return match;

  // Maharashtra PIN codes begin with 4.
  // Use this only when the saved state is missing.
  if (!cleaned && /^4\d{5}$/.test(postalCode)) {
    return "Maharashtra";
  }

  return value?.trim() ?? "";
}

export function SavedAddressPicker({
  onSelect,
}: {
  onSelect: (values: ShippingValues) => void;
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/v1/account/addresses")
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (active && Array.isArray(data?.addresses)) {
          setAddresses(data.addresses);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  if (addresses.length === 0) return null;

  function handleSelect(id: string) {
    setSelected(id);

    const address = addresses.find((item) => item.id === id);
    if (!address) return;

    onSelect({
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: normalizeState(address.state, address.postalCode),
      postalCode: address.postalCode,
    });
  }

  return (
    <div className="rounded-lg border bg-white p-5">
      <label
        htmlFor="saved-shipping"
        className="font-semibold text-forest"
      >
        Use a saved address
      </label>

      <select
        id="saved-shipping"
        className="mt-3 w-full rounded-md border p-3"
        value={selected}
        onChange={(event) => handleSelect(event.target.value)}
      >
        <option value="">Enter address manually</option>

        {addresses.map((address) => (
          <option key={address.id} value={address.id}>
            {address.fullName} — {address.line1}, {address.city}
          </option>
        ))}
      </select>

      <p className="mt-2 text-xs text-muted-foreground">
        Selecting an address fills the shipping form below.
        You can still edit it.
      </p>
    </div>
  );
}

