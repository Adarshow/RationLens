"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/client";

type Props = {
  shopId: string;
  itemId: string;
};

export function NotifyButton({ shopId, itemId }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [on, setOn] = useState(false);
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (on || pending) return;
    setPending(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: existing } = await supabase
        .from("alerts")
        .select("id")
        .eq("user_id", user.id)
        .eq("shop_id", shopId)
        .eq("item_id", itemId)
        .eq("status", "active")
        .maybeSingle();

      if (existing) {
        setOn(true);
        return;
      }

      const { error } = await supabase.from("alerts").insert({
        user_id: user.id,
        shop_id: shopId,
        item_id: itemId,
        status: "active",
      });

      if (error) return;
      setOn(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      fullWidth
      onClick={() => {
        void onClick();
      }}
      disabled={on || pending}
    >
      {on ? t.notified : t.notifyMe}
    </Button>
  );
}
