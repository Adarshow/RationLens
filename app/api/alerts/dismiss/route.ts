import { NextResponse } from "next/server";
import { jsonError, requireOwnedShop } from "@/lib/stockAuth";

export async function POST(request: Request) {
  let body: { shop_id?: unknown; item_id?: unknown };

  try {
    body = await request.json();
  } catch {
    return jsonError("That update is missing details.", 400);
  }

  const auth = await requireOwnedShop(body.shop_id);
  if ("error" in auth) {
    return auth.error;
  }

  const { supabase, shopId } = auth;
  const itemId = body.item_id;
  if (typeof itemId !== "string" || !itemId) {
    return jsonError("That update is missing details.", 400);
  }

  const { error } = await supabase
    .from("alerts")
    .update({ status: "cancelled" })
    .eq("shop_id", shopId)
    .eq("item_id", itemId)
    .eq("status", "active");

  if (error) {
    return jsonError("Couldn't save that update.", 500);
  }

  return NextResponse.json({ ok: true });
}
