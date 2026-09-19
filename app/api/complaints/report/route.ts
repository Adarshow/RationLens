import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/stockAuth";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  console.log("Complaint submit — user:", user?.id ?? "NO USER");

  if (!user) {
    return jsonError("Not authenticated - please log in again", 401);
  }

  const body = await request.json();
  const { shop_id, category, description } = body;

  if (!shop_id || !category) {
    return jsonError("Missing shop_id or category", 400);
  }

  const { error } = await supabase.from("complaints").insert({
    shop_id,
    reporter_id: user.id,
    category,
    description: description || null,
    status: "open",
  });

  if (error) {
    console.error("Complaint insert failed:", JSON.stringify(error, null, 2));
    return jsonError(`Failed to submit complaint: ${error.message}`, 500);
  }

  // Attempt to notify admins if possible, though mostly relying on badge count
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (admins && admins.length > 0) {
    const notifications = admins.map(admin => ({
      user_id: admin.id,
      message: `New complaint reported for shop ${shop_id}.`,
    }));
    await supabase.from("notifications").insert(notifications);
  }

  return NextResponse.json({ success: true });
}
