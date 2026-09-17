import { NotificationsClient } from "./NotificationsClient";
import { createClient } from "@/lib/supabase/server";
import type { Notification } from "@/lib/types";

function toNotification(row: Notification): Notification {
  return {
    id: row.id,
    user_id: row.user_id ?? null,
    message: row.message ?? null,
    read: row.read ?? null,
    created_at: row.created_at ?? null,
  };
}

export default async function NotificationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <NotificationsClient rows={[]} />;
  }

  const { data } = await supabase
    .from("notifications")
    .select("id, user_id, message, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const rows = ((data ?? []) as Notification[]).map(toNotification);
  return <NotificationsClient rows={rows} />;
}
