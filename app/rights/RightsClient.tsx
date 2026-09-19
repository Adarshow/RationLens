"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VoiceControls } from "@/components/VoiceControls";
import { TextLink } from "@/components/TextLink";
import { cn } from "@/lib/cn";
import {
  RATION_CARD_CATEGORIES,
  type RationCardId,
  RIGHTS_DISCLAIMER,
} from "@/lib/rationCardRights";

export function RightsClient() {
  const { lang, t } = useLanguage();
  const [selectedId, setSelectedId] = useState<RationCardId>("aay");

  const selectedCategory = RATION_CARD_CATEGORIES.find(
    (c) => c.id === selectedId
  )!;

  const speakText = [
    selectedCategory.categoryName[lang],
    selectedCategory.eligibility[lang],
    `${t.riceEntitlement}: ${selectedCategory.rice[lang]}`,
    `${t.wheatEntitlement}: ${selectedCategory.wheatOrAtta[lang]}`,
    `${t.keroseneEntitlement}: ${selectedCategory.kerosene[lang]}`
  ].join(". ");

  return (
    <PageContainer>
      <TextLink href="/dashboard">{t.back}</TextLink>
      <div className="mt-3">
        <PageTitle>{t.rightsTitle}</PageTitle>
      </div>
      <p className="mt-6 text-sm md:text-base text-ink/70">{t.rightsIntro}</p>

      <div className="mt-6">
        <SectionHeading>{t.selectCardColor}</SectionHeading>
        <div className="mt-3 flex flex-wrap gap-2">
          {RATION_CARD_CATEGORIES.map((cat) => {
            const isSelected = selectedId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedId(cat.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  isSelected
                    ? "bg-backwater text-white"
                    : "bg-paper text-ink border border-paper-dim hover:bg-paper-dim"
                )}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: cat.colorHex }}
                />
                {cat.colorName[lang]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_auto] lg:items-start">
        <Card>
          <div className="flex flex-col gap-4 p-2">
            <div>
              <h2 className="text-xl font-bold text-ink">
                {selectedCategory.categoryName[lang]}
              </h2>
              <p className="mt-1 text-sm text-ink/70">
                {selectedCategory.eligibility[lang]}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 border-t border-paper-dim pt-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {t.riceEntitlement}
                </span>
                <span className="font-medium text-ink">
                  {selectedCategory.rice[lang]}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-paper-dim pt-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {t.wheatEntitlement}
                </span>
                <span className="font-medium text-ink">
                  {selectedCategory.wheatOrAtta[lang]}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-t border-paper-dim pt-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  {t.keroseneEntitlement}
                </span>
                <span className="font-medium text-ink">
                  {selectedCategory.kerosene[lang]}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:w-72">
          <VoiceControls lang={lang} speakText={speakText} />
        </div>
      </div>

      <div className="mt-8 border-t border-paper-dim pt-6">
        <p className="text-xs text-ink/50 leading-relaxed">
          {RIGHTS_DISCLAIMER[lang]}{" "}
          <a
            href="https://civilsupplieskerala.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-ink/80"
          >
            civilsupplieskerala.gov.in
          </a>
        </p>
      </div>
    </PageContainer>
  );
}
