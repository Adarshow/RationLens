"use client";

import { FormEvent, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ShopCard } from "@/components/ShopCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  CardGrid,
  PageContainer,
  PageTitle,
} from "@/components/ui/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/components/LanguageProvider";
import { VoiceControls } from "@/components/VoiceControls";
import { shopDistanceKm, type StockWithItem } from "@/lib/mockData";
import type { Shop } from "@/lib/types";
import {
  resolveUserLocation,
  useUserLocation,
} from "@/lib/useUserLocation";

const ShopMap = dynamic(() => import("@/components/ShopMap"), { ssr: false });

type Props = {
  shops: Shop[];
  stockByShop: Record<string, StockWithItem[]>;
};

export function DashboardClient({ shops, stockByShop }: Props) {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchItem, setSearchItem] = useState<string | null>(null);
  const [searchShopIds, setSearchShopIds] = useState<string[]>([]);
  const [searchLabel, setSearchLabel] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [searchPending, setSearchPending] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [noteDismissed, setNoteDismissed] = useState(false);
  const { location, status, refresh, placeName } = useUserLocation();
  const activeLocation = resolveUserLocation(status, location);
  const accuracy = location?.accuracy;

  const sorted = useMemo(
    () =>
      [...shops].sort(
        (a, b) => {
          const distA = shopDistanceKm(a, activeLocation);
          const distB = shopDistanceKm(b, activeLocation);
          return (distA ?? 0) - (distB ?? 0);
        }
      ),
    [activeLocation, shops],
  );

  async function searchQuery(value: string) {
    if (!value) {
      setSubmittedQuery("");
      setSearchItem(null);
      setSearchShopIds([]);
      setSearchLabel("");
      setVoiceText("");
      return;
    }

    setSearchPending(true);
    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value }),
      });
      const result = (await response.json()) as {
        item?: string | null;
        intent?: string;
        shop_matches?: { id: string; name: string }[];
      };
      const shopMatches = result.shop_matches ?? [];
      const itemNames =
        lang === "ml"
          ? { rice: "അരി", wheat: "ഗോതമ്പ്", sugar: "പഞ്ചസാര" }
          : { rice: "Rice", wheat: "Wheat", sugar: "Sugar" };
      const itemLabel = result.item
        ? itemNames[result.item as keyof typeof itemNames] ?? result.item
        : null;
      const interpretation = itemLabel
        ? `${t.searchInterpreted}: ${itemLabel} stock`
        : shopMatches.length > 0
          ? `${t.shopSearch}: ${shopMatches[0].name}`
          : `${t.searchInterpreted}: ${result.intent?.replaceAll("_", " ") ?? t.search}`;
      setSubmittedQuery(value);
      setSearchItem(result.item ?? null);
      setSearchShopIds(shopMatches.map((shop) => shop.id));
      setSearchLabel(interpretation);
      setVoiceText(
        lang === "ml"
          ? itemLabel
            ? `${itemLabel} സ്റ്റോക്ക് തിരച്ചിൽ ഫലങ്ങൾ സ്ക്രീനിൽ കാണാം.`
            : shopMatches.length > 0
              ? `${shopMatches[0].name} എന്ന കടയുടെ ഫലങ്ങൾ സ്ക്രീനിൽ കാണാം.`
              : "തിരച്ചിൽ ഫലങ്ങൾ സ്ക്രീനിൽ കാണാം."
          : `${interpretation}. The matching results are shown on screen.`,
      );
    } catch {
      setSubmittedQuery(value);
      setSearchItem(null);
      setSearchShopIds([]);
      setSearchLabel("");
      setVoiceText("I could not understand that search. Please try again.");
    } finally {
      setSearchPending(false);
    }
  }

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    await searchQuery(query.trim());
  }

  const filteredShops = sorted.filter((shop) => {
    if (!submittedQuery) return true;
    const value = (searchItem ?? submittedQuery).toLowerCase();
    const shopMatch = searchShopIds.includes(shop.id);
    const itemMatch = (stockByShop[shop.id] ?? []).some((row) =>
      [row.item.name, ...Object.values(row.item.localized_names)]
        .filter(Boolean)
        .some((name) => name.toLowerCase().includes(value)),
    );
    return shopMatch || itemMatch;
  });

  function rowsForShop(shopId: string) {
    const rows = stockByShop[shopId] ?? [];
    if (!submittedQuery || searchShopIds.includes(shopId) && !searchItem) return rows;
    const value = (searchItem ?? submittedQuery).toLowerCase();
    return rows.filter((row) =>
      [row.item.name, ...Object.values(row.item.localized_names)]
        .filter(Boolean)
        .some((name) => name.toLowerCase().includes(value)),
    );
  }

  const locationNote =
    status === "loading" ? (
      <p className="text-sm text-ink/70">{t.findingLocation}</p>
    ) : !noteDismissed &&
      (status === "denied" || status === "unsupported") ? (
      <p className="text-sm text-ink/70">
        {t.approximateLocation}{" "}
        <button
          type="button"
          className="font-semibold text-monsoon underline-offset-2 hover:underline"
          onClick={() => {
            setNoteDismissed(false);
            refresh();
          }}
        >
          {t.tryAgain}
        </button>
        {" · "}
        <button
          type="button"
          className="font-semibold text-ink/70 underline-offset-2 hover:underline"
          onClick={() => setNoteDismissed(true)}
        >
          {t.dismiss}
        </button>
      </p>
    ) : null;

  const filters = (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
      <form onSubmit={(event) => void onSearch(event)} className="flex flex-col gap-3">
        <Input
          id="query"
          label={t.search}
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {locationNote}
        <Button type="submit" fullWidth disabled={searchPending}>
          {t.search}
        </Button>
        <VoiceControls
          lang={lang}
          speakText={voiceText}
          onTranscript={(value) => {
            setQuery(value);
            void searchQuery(value);
          }}
        />
      </form>
      {searchLabel ? (
        <Card variant="browse">
          <p className="font-medium text-ink">{searchLabel}</p>
        </Card>
      ) : null}
      <div className="grid grid-cols-2 gap-3 mt-1">
        <Button
          type="button"
          fullWidth
          variant={view === "list" ? "primary" : "secondary"}
          onClick={() => setView("list")}
        >
          {t.list}
        </Button>
        <Button
          type="button"
          fullWidth
          variant={view === "map" ? "primary" : "secondary"}
          onClick={() => setView("map")}
        >
          {t.map}
        </Button>
      </div>
      <Card variant="browse" className="mt-2 flex items-start gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink/50 shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>
        </svg>
        <p className="text-sm text-ink/70 leading-relaxed">{t.shopsNearYouNote}</p>
      </Card>
    </aside>
  );

  return (
    <PageContainer>
      {/* HERO SECTION */}
      <div 
        className="relative overflow-hidden rounded-2xl bg-cover bg-center mb-8" 
        style={{ backgroundImage: "url('/nearby.png')" }}
      >
        <div className="bg-gradient-to-r from-paper via-paper/90 to-transparent p-6 md:p-8 min-h-[160px] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-5xl font-bold text-ink leading-tight">
              {t.nearbyShops}
            </h1>
            <p className="mt-2 text-sm md:text-base text-ink/80 leading-relaxed font-medium">
              {t.nearbyShopsSubtitle}
            </p>
          </div>
          
          {activeLocation ? (
            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-center text-sm text-ink/70 bg-paper-dim px-3 py-1.5 rounded-full w-fit max-w-full shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 shrink-0 text-backwater">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span className="font-medium truncate mr-2" title={placeName || `${activeLocation.latitude.toFixed(4)}, ${activeLocation.longitude.toFixed(4)}`}>
                  {placeName ? placeName : `${activeLocation.latitude.toFixed(4)}, ${activeLocation.longitude.toFixed(4)}`}
                </span>
                <button type="button" onClick={() => refresh()} className="ml-auto text-xs font-bold text-backwater hover:underline whitespace-nowrap">
                  Change
                </button>
              </div>
              {status === "granted" && accuracy && accuracy > 1000 && (
                <p className="mt-1 text-xs text-ink/60 font-medium">{t.lowAccuracyLocation}</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* RESULTS SUMMARY ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <p className="text-ink text-base font-semibold">
          {filteredShops.length === 1 
            ? t.shopsFoundOne 
            : (t.shopsFoundMany as string).replace("{n}", String(filteredShops.length))}
        </p>
        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="text-sm font-semibold text-ink/70">Sort by</label>
          <select 
            id="sort" 
            className="rounded-lg border border-paper-dim bg-white px-3 py-1.5 text-sm font-semibold text-ink outline-none focus:border-backwater focus:ring-1 focus:ring-backwater appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2310262B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-no-repeat bg-[position:right_0.5rem_center]"
          >
            <option>Nearest first</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(16rem,20rem)_1fr] lg:items-start lg:gap-8">
        {filters}
        <div>
          <div className="mt-0">
            {view === "map" ? (
              <ShopMap
                shops={filteredShops}
                userLocation={activeLocation}
                showUserMarker={status === "granted"}
              />
            ) : (
              <CardGrid>
                {filteredShops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    stockRows={rowsForShop(shop.id)}
                    userLocation={activeLocation}
                  />
                ))}
              </CardGrid>
            )}
            {filteredShops.length === 0 ? (
              <Card variant="browse" className="mt-4">
                <p className="text-sm text-ink/70">{t.noMatchingStock}</p>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-paper-dim px-6 py-8">
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
  );
}
