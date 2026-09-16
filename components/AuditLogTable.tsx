"use client";

import { formatDistanceToNow } from "date-fns";
import { StatusPill } from "@/components/StatusPill";
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
          <article key={row.id} className="border border-line bg-paper p-4">
            <p className="font-semibold">{item?.name ?? "Item"}</p>
            <p className="mt-2 text-body">
              {row.old_quantity} {item?.unit} → {row.new_quantity} {item?.unit}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusPill status={row.old_status} />
              <StatusPill status={row.new_status} />
            </div>
            <p className="mt-3 text-body text-muted">
              {when} · {row.method} · {row.updated_by}
              {row.human_confirmed ? " · ✓ Verified" : ""}
            </p>
          </article>
        );
      })}
    </div>
  );
}
