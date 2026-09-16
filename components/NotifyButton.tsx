"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useLanguage } from "@/components/LanguageProvider";

export function NotifyButton() {
  const { t } = useLanguage();
  const [on, setOn] = useState(false);

  return (
    <PrimaryButton type="button" onClick={() => setOn(true)} disabled={on}>
      {on ? t.notified : t.notifyMe}
    </PrimaryButton>
  );
}
