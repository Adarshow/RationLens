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

  const formattedComplaints = (complaints || []).map((c: any) => ({
    id: c.id,
    category: c.category,
    description: c.description,
    status: c.status,
    created_at: c.created_at,
    shops: Array.isArray(c.shops) ? c.shops[0] : c.shops,
    profiles: Array.isArray(c.profiles) ? c.profiles[0] : c.profiles,
  }));

  // Order with open first, then resolved
  const open = formattedComplaints.filter(c => c.status === "open");
  const resolved = formattedComplaints.filter(c => c.status === "resolved");

  return <AdminComplaintsClient initialComplaints={[...open, ...resolved]} />;
}
