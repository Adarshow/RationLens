import { redirect } from "next/navigation";
import { AdminComplaintsClient } from "./AdminComplaintsClient";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export default async function AdminComplaintsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const adminDb = createAdminClient();

  // Pre-fetch complaints for SSR
  const { data: complaints, error } = await adminDb
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

  console.log("Complaints fetch result:", { complaints, error });

  // Order with open first, then resolved
  const open = (complaints || []).filter(c => c.status === "open");
  const resolved = (complaints || []).filter(c => c.status === "resolved");

  return <AdminComplaintsClient initialComplaints={[...open, ...resolved]} />;
}
