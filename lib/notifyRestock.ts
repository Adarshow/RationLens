import { createAdminClient } from "@/lib/supabase/admin";

export async function notifyRestock(shopId: string, itemId: string) {
  const admin = createAdminClient();
  const { data: alerts, error: alertError } = await admin
    .from("alerts")
    .select("id, user_id")
    .eq("shop_id", shopId)
    .eq("item_id", itemId)
    .eq("status", "active");

  if (alertError || !alerts?.length) return;

  const [{ data: item }, { data: shop }] = await Promise.all([
    admin.from("items").select("name").eq("id", itemId).maybeSingle(),
    admin.from("shops").select("name").eq("id", shopId).maybeSingle(),
  ]);

  const itemName = (item?.name as string | undefined) ?? "Item";
  const shopName = (shop?.name as string | undefined) ?? "the shop";
  const message = `${itemName} is now available at ${shopName}.`;

  const { error: notifyError } = await admin.from("notifications").insert(
    alerts.map((alert) => ({
      user_id: alert.user_id,
      message,
      read: false,
    })),
  );

  if (notifyError) return;

  await admin
    .from("alerts")
    .update({ status: "triggered" })
    .in(
      "id",
      alerts.map((alert) => alert.id),
    );
}
