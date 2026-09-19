import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireOwnedShop(shopId: unknown) {
  if (typeof shopId !== "string" || !shopId) {
    return { error: jsonError("That update is missing details.", 400) };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: jsonError("You need to log in.", 401) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("shop_id, verification_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.shop_id || profile.shop_id !== shopId) {
    return { error: jsonError("You cannot update this shop.", 403) };
  }

  if (profile.verification_status !== "approved") {
    return { error: jsonError("Your shopkeeper account is still pending verification.", 403) };
  }

  return { supabase, user, shopId };
}

export function statusFromQuantity(quantity: number) {
  return quantity === 0 ? "out_of_stock" : "available";
}
