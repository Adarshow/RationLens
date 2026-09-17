"use client";

import { useState } from "react";
import { StockTable } from "@/components/StockTable";
import { UpdateForm } from "@/components/UpdateForm";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
      <h1 className="text-title font-extrabold text-ink">
        {shop?.name ?? t.shopkeeper}
      </h1>
      <div className="mt-6 flex flex-col gap-3">
        <Button href="/shopkeeper/upload">{t.updatePhoto}</Button>
        <Button href="/shopkeeper/history" variant="secondary">
          {t.history}
        </Button>
      </div>
      {toast ? (
        <Card variant="alert" tone="success" className="mt-6" role="status">
          <p>{t.saved}</p>
        </Card>
      ) : null}
      <div className="mt-6">
        <SectionHeading>{t.stockSection}</SectionHeading>
        <div className="mt-3">
          <StockTable
            rows={rows}
            action={(row) => (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedId(row.id)}
              >
                {t.manualUpdate}
              </Button>
            )}
          />
        </div>
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
