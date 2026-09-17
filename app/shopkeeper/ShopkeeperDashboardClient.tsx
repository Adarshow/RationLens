"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StockTable } from "@/components/StockTable";
import { UpdateForm } from "@/components/UpdateForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/components/LanguageProvider";
import type { StockWithItem } from "@/lib/mockData";

type Props = {
  shopName: string | null;
  rows: StockWithItem[];
  pendingRequestCount?: number;
  initialItemId?: string;
};

function initialSelected(rows: StockWithItem[], itemId?: string) {
  if (itemId) {
    const match = rows.find((row) => row.item_id === itemId);
    if (match) return match.id;
  }
  return rows[0]?.id ?? "";
}

export function ShopkeeperDashboardClient({
  shopName,
  rows,
  pendingRequestCount = 0,
  initialItemId,
}: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(() =>
    initialSelected(rows, initialItemId),
  );
  const [toast, setToast] = useState(false);
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageTitle>{shopName ?? t.shopkeeper}</PageTitle>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/shopkeeper/upload">{t.updatePhoto}</Button>
          <Button href="/shopkeeper/history" variant="secondary">
            {t.history}
          </Button>
          <Button href="/shopkeeper/requests" variant="secondary">
            {t.viewRequests}
            {pendingRequestCount > 0 ? ` (${pendingRequestCount})` : ""}
          </Button>
        </div>
      </div>
      {toast ? (
        <Card variant="alert" tone="success" className="mt-6" role="status">
          <p>{t.saved}</p>
        </Card>
      ) : null}
      <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_minmax(18rem,24rem)] lg:items-start lg:gap-8">
        <div>
          <SectionHeading>{t.stockSection}</SectionHeading>
          <div className="mt-3">
            <StockTable
              columns={2}
              rows={rows}
              action={(row) => (
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
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
              router.refresh();
              window.setTimeout(() => setToast(false), 2500);
            }}
          />
        ) : null}
      </div>
    </PageContainer>
  );
}
