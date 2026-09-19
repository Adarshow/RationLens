import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/stockAuth";

export async function GET() {
  const supabase = createClient();
  const authError = await requireAdmin(supabase);
  if (authError) return authError; // or return empty count? We will return jsonError. Wait, Nav expects { count: number } if possible. 

  // If unauthorized, just return 0 to avoid breaking nav polling
  if (authError) {
      return NextResponse.json({ count: 0 });
  }

  const adminDb = createAdminClient();

  const { count, error } = await adminDb
    .from("complaints")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  if (error) {
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count });
}
