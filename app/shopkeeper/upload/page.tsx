"use client";

import { ImageUploadFlow } from "@/components/ImageUploadFlow";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";

export default function UploadPage() {
  const { t } = useLanguage();

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-3xl">
        <TextLink href="/shopkeeper">{t.back}</TextLink>
        <div className="mt-3">
          <PageTitle>{t.updatePhoto}</PageTitle>
        </div>
        <p className="mt-3 text-sm text-ink/70 md:text-base">{t.checkNumbers}</p>
        <div className="mt-6">
          <ImageUploadFlow />
        </div>
      </div>
    </PageContainer>
  );
}
