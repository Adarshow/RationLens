import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin, jsonError } from "@/lib/stockAuth";

export async function GET() {
  const supabase = createClient();
  const authError = await requireAdmin(supabase);
  if (authError) return authError;

  const adminDb = createAdminClient();

  const { data, error } = await adminDb
    .from("complaints")
    .select(`
      id,
      category,
      description,
      status,
      created_at,
      shops ( name ),
      profiles ( name )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError("Failed to fetch complaints", 500);
  }

  // Sort open first
  const open = data.filter(c => c.status === "open");
  const resolved = data.filter(c => c.status === "resolved");

  return NextResponse.json([...open, ...resolved]);
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const authError = await requireAdmin(supabase);
  if (authError) return authError;

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return jsonError("Missing id or status", 400);
  }

  const adminDb = createAdminClient();

  const updates: any = { status };
  if (status === "resolved") {
    updates.resolved_at = new Date().toISOString();
  }

  const { error } = await adminDb
    .from("complaints")
    .update(updates)
    .eq("id", id);

  if (error) {
    return jsonError("Failed to update complaint", 500);
  }

  return NextResponse.json({ success: true });
}
