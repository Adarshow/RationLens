"use client";

import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useLanguage } from "@/components/LanguageProvider";

export default function WelcomePage() {
  const { t } = useLanguage();

  return (
    <PageShell>
      <h1 className="font-serif text-title">{t.landingTitle}</h1>
      <p className="mt-3 text-body">{t.landingBody}</p>
      <div className="mt-6 flex flex-col gap-3">
        <Link href="/dashboard">
          <PrimaryButton type="button">{t.findShop}</PrimaryButton>
        </Link>
        <Link href="/login">
          <SecondaryButton type="button">{t.imShopkeeper}</SecondaryButton>
        </Link>
      </div>
    </PageShell>
  );
}
