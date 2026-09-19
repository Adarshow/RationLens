"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { RightsReadAloud } from "@/components/RightsReadAloud";
import { TextLink } from "@/components/TextLink";
import { cn } from "@/lib/cn";
import {
  RATION_CARD_CATEGORIES,
  type RationCardId,
} from "@/lib/rationCardRights";

function parseEntitlement(text: string) {
  const parts = text.split("—").map(p => p.trim());
  if (parts.length > 1) {
    return { quantity: parts[0], note: parts[1] };
  }
  return { quantity: parts[0], note: "—" };
}

const RiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-leaf shrink-0">
    <path d="M7 21h10a2 2 0 0 0 2-2V8.5L16 2H8L5 8.5V19a2 2 0 0 0 2 2Z"></path>
    <path d="M10 21v-4a2 2 0 0 1 4 0v4"></path>
    <circle cx="12" cy="11" r="2"></circle>
  </svg>
);

const WheatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-marigold shrink-0">
    <path d="m2 22 10-10"></path>
    <path d="M3.5 13.5 6 16l4-4-2.5-2.5-4 4Z"></path>
    <path d="M8 18l2.5 2.5 4-4-2.5-2.5-4 4Z"></path>
    <path d="M8.5 8.5 11 11l4-4-2.5-2.5-4 4Z"></path>
    <path d="M13 13l2.5 2.5 4-4-2.5-2.5-4 4Z"></path>
    <path d="M16 6a4 4 0 0 0 4-4 4 4 0 0 0-4 4Z"></path>
  </svg>
);

const KeroseneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 shrink-0">
    <path d="M7 22h10"></path>
    <path d="M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6"></path>
    <path d="M10 14V8a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v6"></path>
    <path d="M12 2v4"></path>
  </svg>
);

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

  const riceData = parseEntitlement(selectedCategory.rice[lang]);
  const wheatData = parseEntitlement(selectedCategory.wheatOrAtta[lang]);
  const keroseneData = parseEntitlement(selectedCategory.kerosene[lang]);

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none bg-paper">
        <div 
          className="absolute top-0 left-0 w-full h-72 lg:inset-y-0 lg:left-[40%] lg:w-[60%] lg:h-full bg-cover bg-center" 
          style={{ backgroundImage: "url('/rights-bg.png')" }}
        />
        <div className="absolute top-0 left-0 w-full h-72 lg:inset-y-0 lg:left-[40%] lg:w-[60%] lg:h-full bg-gradient-to-b lg:bg-gradient-to-r from-paper via-paper/90 to-transparent" />
      </div>

      <PageContainer className="relative z-10">
        <TextLink href="/dashboard">{t.back}</TextLink>
        <div className="mt-3">
          <PageTitle>{t.rightsTitle}</PageTitle>
        </div>
        <p className="mt-2 text-sm md:text-base text-ink/70 font-medium">{t.rightsIntro}</p>

        <div className="mt-4">
          <RightsReadAloud lang={lang} speakText={speakText} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {RATION_CARD_CATEGORIES.map((cat) => {
            const isSelected = selectedId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedId(cat.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors border",
                  isSelected
                    ? "bg-paper text-ink border-marigold/30 shadow-sm"
                    : "bg-transparent text-ink/70 border-paper-dim hover:bg-paper-dim"
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

        <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-8">
          <Card className="flex-1 rounded-2xl shadow-sm border border-paper-dim/50">
             <div className="flex items-center gap-4 border-b border-paper-dim pb-5 mb-5 p-2">
               <div className="flex items-center justify-center h-16 w-16 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: selectedCategory.colorHex }}>
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                   <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="2"></rect><rect x="9" y="13" width="6" height="2"></rect><circle cx="6" cy="11" r="1"></circle>
                 </svg>
               </div>
               <div>
                 <h2 className="text-xl md:text-2xl font-extrabold text-ink">
                   {selectedCategory.categoryName[lang]}
                 </h2>
                 <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink/70">
                   {selectedCategory.eligibility[lang]}
                 </p>
               </div>
             </div>

             <div className="overflow-x-auto p-2">
               <table className="w-full text-left text-sm md:text-base border-collapse">
                 <tbody>
                   <tr className="border-b border-paper-dim group">
                     <td className="py-4 pr-4 font-bold text-ink flex items-center gap-3">
                       <RiceIcon />
                       {t.riceEntitlement}
                     </td>
                     <td className="py-4 px-4 text-ink font-medium w-1/3">{riceData.quantity}</td>
                     <td className="py-4 pl-4 text-ink/60 text-sm">{riceData.note}</td>
                   </tr>
                   <tr className="border-b border-paper-dim group">
                     <td className="py-4 pr-4 font-bold text-ink flex items-center gap-3">
                       <WheatIcon />
                       {t.wheatEntitlement}
                     </td>
                     <td className="py-4 px-4 text-ink font-medium w-1/3">{wheatData.quantity}</td>
                     <td className="py-4 pl-4 text-ink/60 text-sm">{wheatData.note}</td>
                   </tr>
                   <tr className="group">
                     <td className="py-4 pr-4 font-bold text-ink flex items-center gap-3">
                       <KeroseneIcon />
                       {t.keroseneEntitlement}
                     </td>
                     <td className="py-4 px-4 text-ink font-medium w-1/3">{keroseneData.quantity}</td>
                     <td className="py-4 pl-4 text-ink/60 text-sm">{keroseneData.note}</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </Card>

          <Card variant="browse" className="bg-leaf/5 border-leaf/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-leaf">
                 <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
               </svg>
               <h3 className="font-bold text-leaf text-base">{t.importantNote}</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-ink/80 font-medium">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-leaf shrink-0 mt-0.5">
                   <path d="M20 6L9 17l-5-5"></path>
                 </svg>
                 <span>{t.disclaimerBullet1}</span>
              </li>
              <li className="flex gap-3 text-sm text-ink/80 font-medium">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-leaf shrink-0 mt-0.5">
                   <path d="M20 6L9 17l-5-5"></path>
                 </svg>
                 <span>{t.disclaimerBullet2}</span>
              </li>
              <li className="flex gap-3 text-sm text-ink/80 font-medium">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-leaf shrink-0 mt-0.5">
                   <path d="M20 6L9 17l-5-5"></path>
                 </svg>
                 <span>{t.disclaimerBullet3}</span>
              </li>
            </ul>
          </Card>
        </div>

        <footer className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-paper-dim px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper shrink-0 shadow-sm border border-black/5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-backwater">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <div>
              <p className="text-lg font-extrabold text-ink">{t.appName}</p>
              <p className="text-sm font-medium text-ink/70 mt-0.5">{t.footerTagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-backwater shrink-0 opacity-80">
               <path d="M8 20V10M12 20V4M16 20v-8"></path><path d="M4 22h16"></path><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
             </svg>
             <p className="text-base font-['Style_Script',cursive] text-ink/70 tracking-wide italic">Nammude Ration, Nammude Avakasham</p>
          </div>
        </footer>
      </PageContainer>
    </>
  );
}
