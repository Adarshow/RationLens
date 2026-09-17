"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/components/LanguageProvider";
import type { StockWithItem } from "@/lib/mockData";
import type { StockStatus } from "@/lib/types";

type Props = {
  row: StockWithItem;
  onSaved: () => void;
};

export function UpdateForm({ row, onSaved }: Props) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<StockStatus>(row.status ?? "unknown");
  const [quantity, setQuantity] = useState(row.quantity ?? 0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function setStatusAndQty(next: StockStatus) {
    setStatus(next);
    if (next === "out_of_stock") {
      setQuantity(0);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/stock/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: row.shop_id,
          item_id: row.item_id,
          status,
          quantity,
        }),
      });

      if (!response.ok) {
        setError("Couldn't save that update — try again.");
        return;
      }

      onSaved();
    } catch {
      setError("Couldn't save that update — try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card as="form" variant="browse" className="lg:sticky lg:top-24" onSubmit={onSubmit}>
      <SectionHeading>{t.manualUpdate}</SectionHeading>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(
          [
            ["available", "Available"],
            ["low_stock", "Limited"],
            ["out_of_stock", "Unavailable"],
          ] as const
        ).map(([value, label]) => (
          <Button
            key={value}
            type="button"
            variant={status === value ? "primary" : "secondary"}
            fullWidth
            disabled={pending}
            onClick={() => setStatusAndQty(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="mt-4">
        <Input
          id={`qty-${row.id}`}
          label={t.quantity}
          type="number"
          min={0}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          fullWidth={false}
          className="w-24"
          disabled={pending}
          onClick={() => setQuantity((value) => Math.max(0, value - 1))}
        >
          Minus
        </Button>
        <Button
          type="button"
          variant="secondary"
          fullWidth={false}
          className="w-24"
          disabled={pending}
          onClick={() => setQuantity((value) => value + 1)}
        >
          Plus
        </Button>
      </div>
      {error ? (
        <Card variant="alert" tone="danger" className="mt-4" role="alert">
          <p className="text-laterite">{error}</p>
        </Card>
      ) : null}
      <div className="mt-4">
        <Button type="submit" fullWidth disabled={pending}>
          {t.saveUpdate}
        </Button>
      </div>
    </Card>
  );
}
