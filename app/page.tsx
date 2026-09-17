"use client";

import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/components/LanguageProvider";

export default function WelcomePage() {
  const { t } = useLanguage();

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="max-w-xl">
          <PageTitle>{t.landingTitle}</PageTitle>
          <p className="mt-3 text-sm text-ink md:text-base">{t.landingBody}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Button href="/dashboard">{t.findShop}</Button>
          <Button href="/login" variant="secondary">
            {t.imShopkeeper}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
