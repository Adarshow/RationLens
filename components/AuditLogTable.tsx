"use client";

import { formatDistanceToNow } from "date-fns";
import { StatusBadge, stockLabel, stockTone } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { CardGrid } from "@/components/ui/PageContainer";
import { getItem } from "@/lib/mockData";
import type { StockUpdate } from "@/lib/types";

type Props = {
  rows: (StockUpdate & {
    item_name?: string | null;
    item_unit?: string | null;
  })[];
};

export function AuditLogTable({ rows }: Props) {
  return (
    <CardGrid>
      {rows.map((row) => {
        const item = getItem(row.item_id ?? "");
        const itemName = row.item_name ?? item?.name ?? "Item";
        const itemUnit = row.item_unit ?? item?.unit;
        const when = row.created_at
          ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true })
          : "";
        return (
          <Card key={row.id} as="article" variant="browse">
            <p className="font-semibold text-ink">{itemName}</p>
            <p className="mt-2 text-sm md:text-base">
              {row.old_quantity} {itemUnit} → {row.new_quantity} {itemUnit}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge
                tone={stockTone(row.old_status)}
                label={stockLabel(row.old_status)}
              />
              <StatusBadge
                tone={stockTone(row.new_status)}
                label={stockLabel(row.new_status)}
              />
            </div>
            <p className="mt-3 text-sm text-ink/70 md:text-base">
              {when} · {row.method} · {row.updated_by}
              {row.human_confirmed ? " · Verified" : ""}
            </p>
          </Card>
        );
      })}
    </CardGrid>
  );
}
