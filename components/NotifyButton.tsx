"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";

export function NotifyButton() {
  const { t } = useLanguage();
  const [on, setOn] = useState(false);

  return (
    <Button type="button" fullWidth onClick={() => setOn(true)} disabled={on}>
      {on ? t.notified : t.notifyMe}
    </Button>
  );
}
