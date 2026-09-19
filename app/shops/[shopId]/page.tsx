import { ShopDetailClient } from "./ShopDetailClient";
import { createClient } from "@/lib/supabase/server";
import {
  getShop,
  getStockForShop,
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
      return <ShopDetailClient shop={null} rows={[]} />;
    }

    const shop = toShop(shopRow as Shop);
    const { data: stockRows } = await supabase
      .from("stock")
      .select(
        "id, shop_id, item_id, quantity, status, last_updated_at, verification_status, updated_by, items (id, name, localized_names, unit)",
      )
      .eq("shop_id", shop.id);

    const rows = ((stockRows ?? []) as StockQueryRow[])
      .map(toStockWithItem)
      .filter((row): row is StockWithItem => row !== null);

    if (rows.length > 0 || shop) {
      return <ShopDetailClient shop={shop} rows={rows} />;
    }
  } catch {
    // Fall back to the embedded demo values when the live schema is not fully provisioned.
  }

  const fallbackShop = getShop(params.shopId) ?? null;
  return (
    <ShopDetailClient
      shop={fallbackShop}
      rows={fallbackShop ? getStockForShop(fallbackShop.id) : []}
    />
  );
}
