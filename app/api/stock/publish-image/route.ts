import { NextResponse } from "next/server";
import { jsonError, requireOwnedShop, statusFromQuantity } from "@/lib/stockAuth";

type PublishItem = {
  item_id?: unknown;
  quantity?: unknown;
};

export async function POST(request: Request) {
  let body: { shop_id?: unknown; items?: unknown };

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
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return jsonError("That update is missing details.", 400);
  }

  const items: { item_id: string; quantity: number }[] = [];
  for (const entry of body.items as PublishItem[]) {
    const itemId = entry.item_id;
    const quantity = Number(entry.quantity);
    if (
      typeof itemId !== "string" ||
      !itemId ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      return jsonError("That update is missing details.", 400);
    }
    items.push({ item_id: itemId, quantity });
  }

  const now = new Date().toISOString();
  const updatedRows = [];

  for (const item of items) {
    const status = statusFromQuantity(item.quantity);
    const { data: current, error: readError } = await supabase
      .from("stock")
      .select("id, quantity, status")
      .eq("shop_id", shopId)
      .eq("item_id", item.item_id)
      .maybeSingle();

    if (readError) {
      return jsonError("Couldn't save that update.", 500);
    }

    let saved;
    if (!current) {
      const { data: inserted, error: insertError } = await supabase
        .from("stock")
        .insert({
          shop_id: shopId,
          item_id: item.item_id,
          quantity: item.quantity,
          status,
          last_updated_at: now,
          verification_status: "ai_assisted",
          updated_by: user.id,
        })
        .select(
          "id, shop_id, item_id, quantity, status, last_updated_at, verification_status, updated_by",
        )
        .maybeSingle();

      if (insertError || !inserted) {
        return jsonError("Couldn't save that update.", 500);
      }
      saved = inserted;
    } else {
      const { data: updated, error: updateError } = await supabase
        .from("stock")
        .update({
          quantity: item.quantity,
          status,
          last_updated_at: now,
          verification_status: "ai_assisted",
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
      saved = updated;
    }

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

    if (auditError) {
      return jsonError("Couldn't save that update.", 500);
    }

    updatedRows.push(saved);
  }

  return NextResponse.json({ rows: updatedRows });
}
