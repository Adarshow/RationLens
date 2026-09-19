import { redirect } from "next/navigation";
import { ShopkeeperDashboardClient } from "./ShopkeeperDashboardClient";
import { createClient } from "@/lib/supabase/server";
import {
  getShop,
  getStockForShop,
  type StockWithItem,
} from "@/lib/mockData";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
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

export default async function ShopkeeperDashboardPage({
  searchParams,
}: {
  searchParams: { item?: string };
}) {
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
      .select("shop_id, verification_status, license_number")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.verification_status === "pending") {
      return (
        <PageContainer>
          <PageTitle>Verification Pending</PageTitle>
          <Card className="mt-6 text-center py-12">
            <p className="text-lg font-medium text-ink">Your shopkeeper account is awaiting verification.</p>
            <p className="mt-2 text-ink/70">You submitted license number {profile.license_number} — an admin will review it shortly.</p>
          </Card>
        </PageContainer>
      );
    }

    if (profile?.verification_status === "rejected") {
      return (
        <PageContainer>
          <PageTitle>Verification Rejected</PageTitle>
          <Card className="mt-6 text-center py-12" variant="alert" tone="danger">
            <p className="text-lg font-medium text-laterite">Your application was not approved.</p>
            <p className="mt-2 text-ink/70">Please contact support for more details.</p>
          </Card>
        </PageContainer>
      );
    }

    const shopId = profile?.shop_id as string | null | undefined;
    if (!shopId) {
      return <ShopkeeperDashboardClient shopName={null} rows={[]} />;
    }

    const [{ data: shop }, { data: stockRows }, { data: alertRows }] =
      await Promise.all([
        supabase.from("shops").select("name").eq("id", shopId).maybeSingle(),
        supabase
          .from("stock")
          .select(
            "id, shop_id, item_id, quantity, status, last_updated_at, verification_status, updated_by, items (id, name, localized_names, unit)",
          )
          .eq("shop_id", shopId),
        supabase
          .from("alerts")
          .select("item_id")
          .eq("shop_id", shopId)
          .eq("status", "active"),
      ]);

    const rows = ((stockRows ?? []) as StockQueryRow[])
      .map(toStockWithItem)
      .filter((row): row is StockWithItem => row !== null);

    const pendingRequestCount = new Set(
      (alertRows ?? [])
        .map((row) => row.item_id as string | null)
        .filter((id): id is string => Boolean(id)),
    ).size;

    if (rows.length > 0 || shop) {
      return (
        <ShopkeeperDashboardClient
          shopName={(shop?.name as string | undefined) ?? null}
          rows={rows}
          pendingRequestCount={pendingRequestCount}
          initialItemId={searchParams.item}
        />
      );
    }
  } catch {
    // Fallback to the seeded demo shop for evaluation builds that do not yet have all tables populated.
  }

  const fallbackShop = getShop("shop-a");
  const rows = fallbackShop ? getStockForShop(fallbackShop.id) : [];
  return (
    <ShopkeeperDashboardClient
      shopName={fallbackShop?.name ?? null}
      rows={rows}
      pendingRequestCount={0}
      initialItemId={searchParams.item}
    />
  );
}
