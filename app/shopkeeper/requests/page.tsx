import { redirect } from "next/navigation";
import { RequestsClient, type RequestGroup } from "@/components/RequestsClient";
import { createClient } from "@/lib/supabase/server";

type AlertRow = {
  item_id: string | null;
  created_at: string | null;
  items: { name: string } | { name: string }[] | null;
};

export default async function RequestsPage() {
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

  const shopId = (profile?.shop_id as string | null | undefined) ?? null;
  if (!shopId) {
    return <RequestsClient shopId={null} groups={[]} />;
  }

  const { data } = await supabase
    .from("alerts")
    .select("item_id, created_at, items (name)")
    .eq("shop_id", shopId)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  const grouped = new Map<string, RequestGroup>();
  for (const row of (data ?? []) as AlertRow[]) {
    if (!row.item_id) continue;
    const item = Array.isArray(row.items) ? row.items[0] : row.items;
    const existing = grouped.get(row.item_id);
    if (existing) {
      existing.count += 1;
      continue;
    }
    grouped.set(row.item_id, {
      itemId: row.item_id,
      itemName: item?.name ?? "Item",
      count: 1,
      oldestCreatedAt: row.created_at,
    });
  }

  return (
    <RequestsClient shopId={shopId} groups={Array.from(grouped.values())} />
  );
}
