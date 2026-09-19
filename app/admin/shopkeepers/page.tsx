import { redirect } from "next/navigation";
import { AdminShopkeepersClient } from "./AdminShopkeepersClient";
import { createClient } from "@/lib/supabase/server";

export default async function AdminShopkeepersPage() {
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

  const { data: shopkeepers } = await supabase
    .from("profiles")
    .select("id, name, phone, license_number, proof_image_path")
    .eq("role", "shopkeeper")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });

  const { data: shops } = await supabase
    .from("shops")
    .select("id, name")
    .order("name", { ascending: true });

  const pendingShopkeepers = await Promise.all(
    (shopkeepers ?? []).map(async (sk) => {
      let imageUrl = null;
      if (sk.proof_image_path) {
        const { data } = await supabase.storage
          .from("shopkeeper-proofs")
          .createSignedUrl(sk.proof_image_path, 60 * 60); // 1 hour
        imageUrl = data?.signedUrl ?? null;
      }
      return { ...sk, imageUrl };
    })
  );

  return <AdminShopkeepersClient shopkeepers={pendingShopkeepers} shops={shops ?? []} />;
}
