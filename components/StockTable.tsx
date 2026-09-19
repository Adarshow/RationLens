"use client";

import type { ReactNode } from "react";
import { StatusBadge, stockLabel, stockTone } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { CardGrid } from "@/components/ui/PageContainer";
import { TrustBadge } from "@/components/TrustBadge";
import { ConfirmStockButtons } from "@/components/ConfirmStockButtons";
import { useLanguage } from "@/components/LanguageProvider";
import type { StockWithItem } from "@/lib/mockData";

type Props = {
  rows: StockWithItem[];
  action?: (row: StockWithItem) => ReactNode;
  columns?: 2 | 3;
};

export function StockTable({ rows, action, columns = 3 }: Props) {
  const { lang } = useLanguage();

  return (
    <CardGrid columns={columns}>
      {rows.map((row) => {
        const name =
          lang === "ml"
            ? row.item.localized_names.ml ?? row.item.name
            : row.item.name;
        const tone = stockTone(row.status);
        const isAlert = row.status !== "available";
        return (
          <Card
            key={row.id}
            variant={isAlert ? "alert" : "browse"}
            tone={tone}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{name}</p>
                <p className="mt-1 tabular-nums">
                  {row.quantity ?? 0} {row.item.unit}
                </p>
              </div>
              <StatusBadge tone={tone} label={stockLabel(row.status)} />
            </div>
            <div className="mt-3 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
              <TrustBadge
                lastUpdatedAt={row.last_updated_at}
                verificationStatus={row.verification_status}
              />
              {row.latest_update_id && row.shop_id && row.item_id ? (
                <ConfirmStockButtons 
                  stockUpdateId={row.latest_update_id} 
                  shopId={row.shop_id} 
                  itemId={row.item_id} 
                />
              ) : null}
            </div>
            {action ? <div className="mt-3">{action(row)}</div> : null}
          </Card>
        );
      })}
    </CardGrid>
  );
}
