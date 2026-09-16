"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useLanguage } from "@/components/LanguageProvider";
import type { StockWithItem } from "@/lib/mockData";
import type { StockStatus } from "@/lib/types";
import { fieldClassName } from "@/lib/ui";

type Props = {
  row: StockWithItem;
  onSaved: () => void;
};

export function UpdateForm({ row, onSaved }: Props) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<StockStatus>(row.status ?? "unknown");
  const [quantity, setQuantity] = useState(row.quantity ?? 0);

  function setStatusAndQty(next: StockStatus) {
    setStatus(next);
    if (next === "out_of_stock") {
      setQuantity(0);
    }
  }

  return (
    <form
      className="mt-6 border border-line bg-paper p-4"
      onSubmit={(event) => {
        event.preventDefault();
        // TODO: replace with real Supabase query
        onSaved();
      }}
    >
      <p className="font-semibold">{t.manualUpdate}</p>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {(
          [
            ["available", "Available"],
            ["low_stock", "Low Stock"],
            ["out_of_stock", "Out of Stock"],
          ] as const
        ).map(([value, label]) => (
          <SecondaryButton
            key={value}
            type="button"
            className={status === value ? "border-stamp bg-stamp text-white" : ""}
            onClick={() => setStatusAndQty(value)}
          >
            {label}
          </SecondaryButton>
        ))}
      </div>
      <label className="mt-4 block font-semibold" htmlFor={`qty-${row.id}`}>
        {t.quantity}
      </label>
      <div className="mt-2 flex gap-2">
        <SecondaryButton
          type="button"
          className="w-24"
          onClick={() => setQuantity((value) => Math.max(0, value - 1))}
        >
          Minus
        </SecondaryButton>
        <input
          id={`qty-${row.id}`}
          className={fieldClassName}
          type="number"
          min={0}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
        <SecondaryButton
          type="button"
          className="w-24"
          onClick={() => setQuantity((value) => value + 1)}
        >
          Plus
        </SecondaryButton>
      </div>
      <div className="mt-4">
        <PrimaryButton type="submit">{t.saveUpdate}</PrimaryButton>
      </div>
    </form>
  );
}
