import { NextResponse } from "next/server";
import { jsonError, requireOwnedShop, statusFromQuantity } from "@/lib/stockAuth";
import { notifyRestock } from "@/lib/notifyRestock";

type ConfirmItem = { item_id?: unknown; quantity?: unknown };

export async function POST(request: Request) {
  let body: { shop_id?: unknown; human_confirmed?: unknown; items?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("That update is missing details.", 400);
  }

  if (body.human_confirmed !== true) {
    return jsonError("Confirm the detected values before publishing.", 400);
  }

  const auth = await requireOwnedShop(body.shop_id);
  if ("error" in auth) return auth.error;
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return jsonError("That update is missing details.", 400);
  }

  const { supabase, user, shopId } = auth;
  const items: { item_id: string; quantity: number }[] = [];
  for (const entry of body.items as ConfirmItem[]) {
    const quantity = Number(entry.quantity);
    if (
      typeof entry.item_id !== "string" ||
      !entry.item_id ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      return jsonError("That update is missing details.", 400);
    }
    items.push({ item_id: entry.item_id, quantity });
  }

  const now = new Date().toISOString();
  const rows = [];
  for (const item of items) {
    const status = statusFromQuantity(item.quantity);
    const { data: current, error: currentError } = await supabase
      .from("stock")
      .select("id, quantity, status")
      .eq("shop_id", shopId)
      .eq("item_id", item.item_id)
      .maybeSingle();
    if (currentError) return jsonError("Couldn't save that update.", 500);

    const payload = {
      shop_id: shopId,
      item_id: item.item_id,
      quantity: item.quantity,
      status,
      last_updated_at: now,
      verification_status: "ai_assisted",
      updated_by: user.id,
    };
    const result = current
      ? await supabase.from("stock").update(payload).eq("id", current.id).select().maybeSingle()
      : await supabase.from("stock").insert(payload).select().maybeSingle();
    if (result.error || !result.data) return jsonError("Couldn't save that update.", 500);

    const { error: auditError } = await supabase.from("stock_updates").insert({
      shop_id: shopId,
      item_id: item.item_id,
      old_quantity: current?.quantity ?? null,
      new_quantity: item.quantity,
      old_status: current?.status ?? null,
      new_status: status,
      method: "ai_image",
      updated_by: user.id,
      human_confirmed: true,
    });
    if (auditError) return jsonError("Couldn't save that update.", 500);

    if (
      status === "available" &&
      (current?.status === "low_stock" || current?.status === "out_of_stock")
    ) {
      try {
        await notifyRestock(shopId, item.item_id);
      } catch {
        // Inventory and audit writes remain successful if notifications are unavailable.
      }
    }
    rows.push(result.data);
  }

  return NextResponse.json({ rows });
}
