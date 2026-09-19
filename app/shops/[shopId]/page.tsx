import { ShopDetailClient } from "./ShopDetailClient";
import { createClient } from "@/lib/supabase/server";
import {
  getShop,
  getStockForShop,
  type StockWithItem,
} from "@/lib/mockData";
import type { Item, LocalizedNames, Shop, Stock, StockUpdate, StockStatus } from "@/lib/types";

type HistoryRow = StockUpdate & {
  items?: { name?: string; unit?: string | null } | { name?: string; unit?: string | null }[] | null;
};

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

function toStockUpdate(row: HistoryRow): StockUpdate & {
  item_name?: string | null;
  item_unit?: string | null;
} {
  const item = Array.isArray(row.items) ? row.items[0] : row.items;
  return {
    id: row.id,
    shop_id: row.shop_id ?? null,
    item_id: row.item_id ?? null,
    old_quantity: row.old_quantity === null || row.old_quantity === undefined ? null : Number(row.old_quantity),
    new_quantity: row.new_quantity === null || row.new_quantity === undefined ? null : Number(row.new_quantity),
    old_status: (row.old_status ?? null) as StockStatus | null,
    new_status: (row.new_status ?? null) as StockStatus | null,
    method: row.method ?? null,
    updated_by: row.updated_by ?? null,
    human_confirmed: row.human_confirmed ?? null,
    created_at: row.created_at ?? null,
    item_name: item?.name ?? null,
    item_unit: item?.unit ?? null,
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
    contact_person: row.contact_person ?? null,
    contact_phone: row.contact_phone ?? null,
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

export default async function ShopDetailPage({
  params,
}: {
  params: { shopId: string };
}) {
  try {
    const supabase = createClient();
    const { data: shopRow } = await supabase
      .from("shops")
      .select("id, name, address, latitude, longitude, created_at, contact_person, contact_phone")
      .eq("id", params.shopId)
      .maybeSingle();

    if (!shopRow) {
      return <ShopDetailClient shop={null} rows={[]} history={[]} />;
    }

    const shop = toShop(shopRow as Shop);
    const { data: stockRows } = await supabase
      .from("stock")
      .select(
        "id, shop_id, item_id, quantity, status, last_updated_at, verification_status, updated_by, items (id, name, localized_names, unit)",
      )
      .eq("shop_id", shop.id);

    const { data: historyRows } = await supabase
      .from("stock_updates")
      .select("id, shop_id, item_id, old_quantity, new_quantity, old_status, new_status, method, updated_by, human_confirmed, created_at, items (name, unit)")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false })
      .limit(10);
      
    const history = ((historyRows ?? []) as HistoryRow[]).map(toStockUpdate);

    const rows = ((stockRows ?? []) as StockQueryRow[])
      .map(toStockWithItem)
      .filter((row): row is StockWithItem => row !== null)
      .map(row => {
        const latest = history.find(h => h.item_id === row.item_id);
        return { ...row, latest_update_id: latest?.id ?? null };
      });

    if (rows.length > 0 || shop) {
      return <ShopDetailClient shop={shop} rows={rows} history={history} />;
    }
  } catch {
    // Fall back to the embedded demo values when the live schema is not fully provisioned.
  }

  const fallbackShop = getShop(params.shopId) ?? null;
  return (
    <ShopDetailClient
      shop={fallbackShop}
      rows={fallbackShop ? getStockForShop(fallbackShop.id) : []}
      history={[]}
    />
  );
}
