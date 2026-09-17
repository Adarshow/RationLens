"use client";

import { ImageUploadFlow } from "@/components/ImageUploadFlow";
import { PageShell } from "@/components/PageShell";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";

export default function UploadPage() {
  const { t } = useLanguage();

  return (
    <PageShell>
      <TextLink href="/shopkeeper">{t.back}</TextLink>
      <h1 className="mt-3 text-title font-extrabold text-ink">
        {t.updatePhoto}
      </h1>
      <p className="mt-3 text-body text-ink/70">{t.checkNumbers}</p>
      <div className="mt-6">
        <ImageUploadFlow />
      </div>
    </PageShell>
  );
}
