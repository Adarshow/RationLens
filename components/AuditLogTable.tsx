"use client";

import { formatDistanceToNow } from "date-fns";
import { StatusBadge, stockLabel, stockTone } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { getItem } from "@/lib/mockData";
import type { StockUpdate } from "@/lib/types";

type Props = {
  rows: StockUpdate[];
};

export function AuditLogTable({ rows }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const item = getItem(row.item_id ?? "");
        const when = row.created_at
          ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true })
          : "";
        return (
          <Card key={row.id} as="article" variant="browse">
            <p className="font-semibold text-ink">{item?.name ?? "Item"}</p>
            <p className="mt-2 text-body">
              {row.old_quantity} {item?.unit} → {row.new_quantity} {item?.unit}
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
            <p className="mt-3 text-body text-ink/70">
              {when} · {row.method} · {row.updated_by}
              {row.human_confirmed ? " · Verified" : ""}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
