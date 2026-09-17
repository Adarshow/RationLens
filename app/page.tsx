"use client";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";

export default function WelcomePage() {
  const { t } = useLanguage();

  return (
    <PageShell>
      <h1 className="text-title font-extrabold text-ink">{t.landingTitle}</h1>
      <p className="mt-3 text-body">{t.landingBody}</p>
      <div className="mt-6 flex flex-col gap-3">
        <Button href="/dashboard">{t.findShop}</Button>
        <Button href="/login" variant="secondary">
          {t.imShopkeeper}
        </Button>
      </div>
    </PageShell>
  );
}
