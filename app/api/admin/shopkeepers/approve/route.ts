import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/stockAuth";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("You need to log in.", 401);
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (adminProfile?.role !== "admin") {
    return jsonError("Unauthorized", 403);
  }

  const body = await request.json();
  const { profile_id, shop_id } = body;

  if (!profile_id || !shop_id) {
    return jsonError("Missing profile_id or shop_id", 400);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ verification_status: "approved", shop_id })
    .eq("id", profile_id);

  if (error) {
    return jsonError("Failed to approve shopkeeper", 500);
  }

  return NextResponse.json({ success: true });
}
