"use client";

import type { ReactNode } from "react";
import { StatusPill } from "@/components/StatusPill";
import { TrustBadge } from "@/components/TrustBadge";
import { useLanguage } from "@/components/LanguageProvider";
import type { StockWithItem } from "@/lib/mockData";

type Props = {
  rows: StockWithItem[];
  action?: (row: StockWithItem) => ReactNode;
};

export function StockTable({ rows, action }: Props) {
  const { lang } = useLanguage();

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const name =
          lang === "ml" ? row.item.localized_names.ml ?? row.item.name : row.item.name;
        return (
          <div key={row.id} className="border border-line bg-paper p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{name}</p>
                <p className="mt-1 tabular-nums">
                  {row.quantity ?? 0} {row.item.unit}
                </p>
              </div>
              <StatusPill status={row.status} />
            </div>
            <div className="mt-3">
              <TrustBadge
                lastUpdatedAt={row.last_updated_at}
                verificationStatus={row.verification_status}
              />
            </div>
            {action ? <div className="mt-3">{action(row)}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
