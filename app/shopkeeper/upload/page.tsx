import { redirect } from "next/navigation";
import { UploadClient } from "./UploadClient";
import { createClient } from "@/lib/supabase/server";

type ItemRow = {
  id: string;
  name: string;
};

export default async function UploadPage() {
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
    return <UploadClient shopId={null} items={[]} />;
  }

  const { data: stockRows } = await supabase
    .from("stock")
    .select("items (id, name)")
    .eq("shop_id", shopId);

  const items: ItemRow[] = [];
  for (const row of stockRows ?? []) {
    const raw = (row as { items?: ItemRow | ItemRow[] | null }).items;
    const item = Array.isArray(raw) ? raw[0] : raw;
    if (!item?.id || !item.name) continue;
    if (items.some((existing) => existing.id === item.id)) continue;
    items.push({ id: item.id, name: item.name });
  }

  return <UploadClient shopId={shopId} items={items} />;
}
