"use client";

import { useState } from "react";
import Link from "next/link";
import { StockTable } from "@/components/StockTable";
import { UpdateForm } from "@/components/UpdateForm";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useLanguage } from "@/components/LanguageProvider";
import {
  SHOPKEEPER_SHOP_ID,
  getShop,
  getStockForShop,
} from "@/lib/mockData";

export default function ShopkeeperDashboardPage() {
  const { t } = useLanguage();
  const shop = getShop(SHOPKEEPER_SHOP_ID);
  const rows = getStockForShop(SHOPKEEPER_SHOP_ID);
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? "");
  const [toast, setToast] = useState(false);
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];

  return (
    <PageShell>
      <h1 className="font-serif text-title">{shop?.name ?? t.shopkeeper}</h1>
      <div className="mt-6 flex flex-col gap-3">
        <Link href="/shopkeeper/upload">
          <PrimaryButton type="button">{t.updatePhoto}</PrimaryButton>
        </Link>
        <Link href="/shopkeeper/history">
          <SecondaryButton type="button">{t.history}</SecondaryButton>
        </Link>
      </div>
      {toast ? (
        <p
          className="mt-6 border border-available bg-available-bg p-4 text-available"
          role="status"
        >
          {t.saved}
        </p>
      ) : null}
      <div className="mt-6">
        <StockTable
          rows={rows}
          action={(row) => (
            <SecondaryButton type="button" onClick={() => setSelectedId(row.id)}>
              {t.manualUpdate}
            </SecondaryButton>
          )}
        />
      </div>
      {selected ? (
        <UpdateForm
          key={selected.id}
          row={selected}
          onSaved={() => {
            setToast(true);
            window.setTimeout(() => setToast(false), 2500);
          }}
        />
      ) : null}
    </PageShell>
  );
}
