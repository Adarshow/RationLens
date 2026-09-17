import { redirect } from "next/navigation";
import { ShopkeeperDashboardClient } from "./ShopkeeperDashboardClient";
import { createClient } from "@/lib/supabase/server";
import type { StockWithItem } from "@/lib/mockData";
import type { Item, LocalizedNames, Stock } from "@/lib/types";

type StockQueryRow = Stock & {
  items: Item | Item[] | null;
};

function toItem(raw: Item | Item[] | null): Item | null {
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row?.id || !row.name) return null;
  return {
    id: row.id,
    name: row.name,
    localized_names: (row.localized_names ?? {}) as LocalizedNames,
    unit: row.unit ?? null,
  };
}

function toStockWithItem(row: StockQueryRow): StockWithItem | null {
  const item = toItem(row.items);
  if (!item || !row.shop_id) return null;
  return {
    id: row.id,
    shop_id: row.shop_id,
    item_id: row.item_id,
    quantity:
      row.quantity === null || row.quantity === undefined
        ? null
        : Number(row.quantity),
    status: row.status,
    last_updated_at: row.last_updated_at,
    verification_status: row.verification_status,
    updated_by: row.updated_by,
    item,
  };
}

export default async function ShopkeeperDashboardPage() {
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
    return <ShopkeeperDashboardClient shopName={null} rows={[]} />;
  }

  const [{ data: shop }, { data: stockRows }] = await Promise.all([
    supabase.from("shops").select("name").eq("id", shopId).maybeSingle(),
    supabase
      .from("stock")
      .select(
        "id, shop_id, item_id, quantity, status, last_updated_at, verification_status, updated_by, items (id, name, localized_names, unit)",
      )
      .eq("shop_id", shopId),
  ]);

  const rows = ((stockRows ?? []) as StockQueryRow[])
    .map(toStockWithItem)
    .filter((row): row is StockWithItem => row !== null);

  return (
    <ShopkeeperDashboardClient
      shopName={(shop?.name as string | undefined) ?? null}
      rows={rows}
    />
  );
}
