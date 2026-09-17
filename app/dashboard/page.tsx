"use client";

import { FormEvent, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ShopCard } from "@/components/ShopCard";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useLanguage } from "@/components/LanguageProvider";
import { getStockForShop, shops, shopDistanceKm } from "@/lib/mockData";

const ShopMap = dynamic(() => import("@/components/ShopMap"), { ssr: false });

export default function DashboardPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [showChip, setShowChip] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const sorted = useMemo(
    () => [...shops].sort((a, b) => shopDistanceKm(a) - shopDistanceKm(b)),
    [],
  );

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setShowChip(true);
  }

  return (
    <PageShell>
      <h1 className="text-title font-extrabold text-ink">{t.nearbyShops}</h1>

      <form className="mt-4" onSubmit={onSearch}>
        <Input
          id="query"
          label={t.search}
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-3">
          <Button type="submit">{t.search}</Button>
        </div>
      </form>

      {showChip ? (
        <Card variant="browse" className="mt-4">
          <p className="font-medium text-ink">{t.understood}</p>
        </Card>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant={view === "list" ? "primary" : "secondary"}
          onClick={() => setView("list")}
        >
          {t.list}
        </Button>
        <Button
          type="button"
          variant={view === "map" ? "primary" : "secondary"}
          onClick={() => setView("map")}
        >
          {t.map}
        </Button>
      </div>

      <div className="mt-6">
        <SectionHeading>
          {view === "map" ? t.map : t.list}
        </SectionHeading>
        <div className="mt-3">
          {view === "map" ? (
            <ShopMap shops={sorted} />
          ) : (
            <div className="flex flex-col gap-3">
              {sorted.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  stockRows={getStockForShop(shop.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
