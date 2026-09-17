import { redirect } from "next/navigation";
import { HistoryClient } from "./HistoryClient";
import { createClient } from "@/lib/supabase/server";
import { stockUpdates as fallbackUpdates } from "@/lib/mockData";
import type { StockStatus, StockUpdate } from "@/lib/types";

function toStockUpdate(row: StockUpdate): StockUpdate {
  return {
    id: row.id,
    shop_id: row.shop_id ?? null,
    item_id: row.item_id ?? null,
    old_quantity:
      row.old_quantity === null || row.old_quantity === undefined
        ? null
        : Number(row.old_quantity),
    new_quantity:
      row.new_quantity === null || row.new_quantity === undefined
        ? null
        : Number(row.new_quantity),
    old_status: (row.old_status ?? null) as StockStatus | null,
    new_status: (row.new_status ?? null) as StockStatus | null,
    method: row.method ?? null,
    updated_by: row.updated_by ?? null,
    human_confirmed: row.human_confirmed ?? null,
    created_at: row.created_at ?? null,
  };
}

export default async function HistoryPage() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("shop_id")
      .eq("id", user.id)
      .maybeSingle();

    const shopId = profile?.shop_id as string | null | undefined;
    if (!shopId) {
      return <HistoryClient rows={[]} />;
    }

    const { data } = await supabase
      .from("stock_updates")
      .select(
        "id, shop_id, item_id, old_quantity, new_quantity, old_status, new_status, method, updated_by, human_confirmed, created_at",
      )
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false });

    const rows = ((data ?? []) as StockUpdate[]).map(toStockUpdate);
    if (rows.length > 0) {
      return <HistoryClient rows={rows} />;
    }
  } catch {
    // Keep the demo history visible while the live inventory tables are being initialized.
  }

  return <HistoryClient rows={fallbackUpdates} />;
}
