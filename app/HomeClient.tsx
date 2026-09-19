"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ShopCard } from "@/components/ShopCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageContainer } from "@/components/ui/PageContainer";
import { CardGrid } from "@/components/ui/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/components/LanguageProvider";
import { shopDistanceKm, type StockWithItem } from "@/lib/mockData";
import type { Shop } from "@/lib/types";
import { resolveUserLocation, useUserLocation } from "@/lib/useUserLocation";
import { RATION_CARD_CATEGORIES, RIGHTS_DISCLAIMER } from "@/lib/rationCardRights";

type Props = {
  shops: Shop[];
  stockByShop: Record<string, StockWithItem[]>;
};

export function HomeClient({ shops, stockByShop }: Props) {
  const { lang, t } = useLanguage();
  const { location, status, placeName } = useUserLocation();
  const activeLocation = resolveUserLocation(status, location);

  const sortedShops = useMemo(
    () =>
      [...shops]
        .sort((a, b) => {
          const distA = shopDistanceKm(a, activeLocation);
          const distB = shopDistanceKm(b, activeLocation);
          return (distA ?? 0) - (distB ?? 0);
        })
        .slice(0, 3),
    [activeLocation, shops]
  );

  function rowsForShop(shopId: string) {
    return stockByShop[shopId] ?? [];
  }

  return (
    <PageContainer>
      {/* HERO SECTION */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-cover bg-center" 
        style={{ backgroundImage: "url('/background.png')" }}
      >
        <div className="bg-gradient-to-r from-paper via-paper/90 to-transparent p-6 md:p-12 min-h-[300px] flex flex-col justify-center">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-5xl font-bold text-ink leading-tight">
              {t.landingTitle}
            </h1>
            <p className="mt-4 text-sm md:text-base text-ink/80 leading-relaxed font-medium">
              {t.landingBody}
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <Button href="/dashboard" fullWidth={false}>{t.findShop}</Button>
              <Button href="/login" variant="secondary" fullWidth={false}>
                {t.imShopkeeper}
              </Button>
            </div>
            
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs md:text-sm font-semibold text-ink/70">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-backwater">
                <path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span>{t.taglineCommunity}</span>
              <span className="text-ink/30">|</span>
              <span>{t.taglineTransparent}</span>
              <span className="text-ink/30">|</span>
              <span>{t.taglineFair}</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEARBY SHOPS PREVIEW */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <SectionHeading>{t.nearbyShops}</SectionHeading>
            <p className="mt-1 text-sm text-ink/70">{t.nearbyShopsSubtitle}</p>
          </div>
          {activeLocation ? (
            <div className="flex items-center text-sm text-ink/70 bg-paper-dim px-3 py-1.5 rounded-full w-fit max-w-[90%] md:max-w-[50%]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 shrink-0 text-backwater">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="font-medium truncate mr-2" title={placeName || `${activeLocation.latitude.toFixed(4)}, ${activeLocation.longitude.toFixed(4)}`}>
                {placeName ? placeName : `${activeLocation.latitude.toFixed(4)}, ${activeLocation.longitude.toFixed(4)}`}
              </span>
              <Link href="/dashboard" className="ml-auto text-xs font-bold text-monsoon hover:underline whitespace-nowrap">
                Change
              </Link>
            </div>
          ) : null}
        </div>
        <div className="mt-4">
          <CardGrid columns={3}>
            {sortedShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                stockRows={rowsForShop(shop.id)}
                userLocation={activeLocation}
              />
            ))}
          </CardGrid>
        </div>
      </div>

      {/* KNOW YOUR RIGHTS PREVIEW */}
      <div className="mt-8 border-t border-paper-dim pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <SectionHeading>{t.rightsTitle}</SectionHeading>
            <p className="mt-1 text-sm text-ink/70">{t.rightsIntro}</p>
          </div>
          <Link href="/rights" className="text-sm font-bold text-backwater hover:underline flex items-center gap-1 group">
            {t.understandEntitlements}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
              <path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>
        
        <div className="mt-4">
          <CardGrid columns={2}>
            {RATION_CARD_CATEGORIES.map((category) => (
              <Link key={category.id} href="/rights" className="block h-full group">
                <Card variant="browse" className="flex items-center gap-4 h-full group-hover:bg-paper-dim transition-colors">
                  <div 
                    className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-white/20 shadow-sm"
                    style={{ backgroundColor: category.colorHex }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
                      {category.colorName[lang]} Card
                    </p>
                    <h3 className="font-bold text-ink truncate mt-0.5">
                      {category.categoryName[lang]}
                    </h3>
                    <p className="text-sm text-ink/70 truncate mt-0.5">
                      {category.eligibility[lang]}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-ink/30 group-hover:text-ink/60 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6"></path>
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </CardGrid>
        </div>

        <div className="mt-4 bg-paper-dim rounded-lg p-3 text-xs text-ink/60 border border-paper-dim/50">
          {RIGHTS_DISCLAIMER[lang]}
        </div>
      </div>
    </PageContainer>
  );
}
