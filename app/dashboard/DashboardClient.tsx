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
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [searchItem, setSearchItem] = useState<string | null>(null);
  const [searchLabel, setSearchLabel] = useState("");
  const [searchPending, setSearchPending] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [noteDismissed, setNoteDismissed] = useState(false);
  const { location, status, refresh } = useUserLocation();
  const activeLocation = resolveUserLocation(status, location);

  const sorted = useMemo(
    () =>
      [...shops].sort(
        (a, b) =>
          shopDistanceKm(a, activeLocation) - shopDistanceKm(b, activeLocation),
      ),
    [activeLocation, shops],
  );

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      setSearchItem(null);
      setSearchLabel("");
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
      };
      setSearchItem(result.item ?? null);
      setSearchLabel(
        `Understood: ${result.intent?.replaceAll("_", " ") ?? "check stock"}${
          result.item ? ` - ${result.item}` : ""
        }`,
      );
    } catch {
      setSearchItem(null);
      setSearchLabel("");
    } finally {
      setSearchPending(false);
    }
  }

  const filteredShops = sorted.filter((shop) => {
    if (!searchItem && !query.trim()) return true;
    const value = (searchItem ?? query).toLowerCase();
    return (stockByShop[shop.id] ?? []).some((row) =>
      [row.item.name, ...Object.values(row.item.localized_names)]
        .filter(Boolean)
        .some((name) => name.toLowerCase().includes(value)),
    );
  });

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
      </form>
      {searchLabel ? (
        <Card variant="browse">
          <p className="font-medium text-ink">{searchLabel}</p>
        </Card>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
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
    </aside>
  );

  return (
    <PageContainer>
      <PageTitle>{t.nearbyShops}</PageTitle>
      <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(16rem,20rem)_1fr] lg:items-start lg:gap-8">
        {filters}
        <div>
          <SectionHeading>
            {view === "map" ? t.map : t.list}
          </SectionHeading>
          <div className="mt-3">
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
                    stockRows={stockByShop[shop.id] ?? []}
                    userLocation={activeLocation}
                  />
                ))}
              </CardGrid>
            )}
            {filteredShops.length === 0 ? (
              <Card variant="browse" className="mt-4">
                <p className="text-sm text-ink/70">No matching stock found.</p>
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
