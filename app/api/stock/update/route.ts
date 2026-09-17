import { NextResponse } from "next/server";
import { jsonError, requireOwnedShop } from "@/lib/stockAuth";
import { notifyRestock } from "@/lib/notifyRestock";
import type { StockStatus } from "@/lib/types";

const STATUSES: StockStatus[] = [
  "available",
  "low_stock",
  "out_of_stock",
  "unknown",
];

export async function POST(request: Request) {
  let body: {
    shop_id?: unknown;
    item_id?: unknown;
    status?: unknown;
    quantity?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("That update is missing details.", 400);
  }

  const auth = await requireOwnedShop(body.shop_id);
  if ("error" in auth) {
    return auth.error;
  }

  const { supabase, user, shopId } = auth;
  const itemId = body.item_id;
  const status = body.status;
  const quantity = Number(body.quantity);

  if (
    typeof itemId !== "string" ||
    !itemId ||
    typeof status !== "string" ||
    !STATUSES.includes(status as StockStatus) ||
    !Number.isFinite(quantity) ||
    quantity < 0
  ) {
    return jsonError("That update is missing details.", 400);
  }

  const { data: current, error: readError } = await supabase
    .from("stock")
    .select("id, shop_id, item_id, quantity, status")
    .eq("shop_id", shopId)
    .eq("item_id", itemId)
    .maybeSingle();

  if (readError) {
    return jsonError("Couldn't save that update.", 500);
  }
  if (!current) {
    return jsonError("That stock row was not found.", 404);
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("stock")
    .update({
      quantity,
      status,
      last_updated_at: now,
      updated_by: user.id,
    })
    .eq("id", current.id)
    .select(
      "id, shop_id, item_id, quantity, status, last_updated_at, verification_status, updated_by",
    )
    .maybeSingle();

  if (updateError || !updated) {
    return jsonError("Couldn't save that update.", 500);
  }

  const { error: auditError } = await supabase.from("stock_updates").insert({
    shop_id: shopId,
    item_id: itemId,
    old_quantity: current.quantity,
    new_quantity: quantity,
    old_status: current.status,
    new_status: status,
    method: "manual",
    updated_by: user.id,
    human_confirmed: true,
  });

  if (auditError) {
    return jsonError("Couldn't save that update.", 500);
  }

  const becameAvailable =
    status === "available" &&
    (current.status === "low_stock" || current.status === "out_of_stock");
  if (becameAvailable) {
    try {
      await notifyRestock(shopId, itemId);
    } catch {
      // Stock is already saved; do not fail the shopkeeper's update.
    }
  }

  return NextResponse.json(updated);
}
