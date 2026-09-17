import { DashboardClient } from "./DashboardClient";
import { createClient } from "@/lib/supabase/server";
import {
  getItem,
  shops as fallbackShops,
  stock as fallbackStock,
  type StockWithItem,
} from "@/lib/mockData";
import type { Item, LocalizedNames, Shop, Stock } from "@/lib/types";

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

function toShop(row: Shop): Shop {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? null,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    created_at: row.created_at ?? null,
  };
}

export default async function DashboardPage() {
  try {
    const supabase = createClient();
    const [{ data: shopRows }, { data: stockRows }] = await Promise.all([
      supabase
        .from("shops")
        .select("id, name, address, latitude, longitude, created_at"),
      supabase.from("stock").select(
        "id, shop_id, item_id, quantity, status, last_updated_at, verification_status, updated_by, items (id, name, localized_names, unit)",
      ),
    ]);

    const shops = ((shopRows ?? []) as Shop[]).map(toShop);
    const stockByShop: Record<string, StockWithItem[]> = {};

    for (const row of (stockRows ?? []) as StockQueryRow[]) {
      const item = toItem(row.items);
      if (!item || !row.shop_id) continue;
      const stockRow: StockWithItem = {
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
      const list = stockByShop[row.shop_id] ?? [];
      list.push(stockRow);
      stockByShop[row.shop_id] = list;
    }

    if (shops.length > 0 || Object.keys(stockByShop).length > 0) {
      return <DashboardClient shops={shops} stockByShop={stockByShop} />;
    }
  } catch {
    // Fall through to the embedded demo data if the live project schema is not yet ready.
  }

  const stockByShop: Record<string, StockWithItem[]> = {};
  for (const row of fallbackStock) {
    if (!row.shop_id) continue;
    const item = getItem(row.item_id ?? "");
    if (!item) continue;
    const list = stockByShop[row.shop_id] ?? [];
    list.push({ ...row, item });
    stockByShop[row.shop_id] = list;
  }

  return <DashboardClient shops={fallbackShops} stockByShop={stockByShop} />;
}
