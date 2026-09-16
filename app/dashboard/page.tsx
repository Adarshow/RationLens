"use client";

import { FormEvent, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ShopCard } from "@/components/ShopCard";
import { PageShell } from "@/components/PageShell";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { getStockForShop, shops, shopDistanceKm } from "@/lib/mockData";
import { fieldClassName } from "@/lib/ui";

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
    // TODO: replace with real /api/query intent extraction
    setShowChip(true);
  }

  return (
    <PageShell>
      <h1 className="font-serif text-title">{t.nearbyShops}</h1>
      <TextLink href="/notifications">{t.notifications}</TextLink>

      <form className="mt-6" onSubmit={onSearch}>
        <label htmlFor="query" className="font-semibold">
          {t.search}
        </label>
        <input
          id="query"
          className={`mt-2 ${fieldClassName}`}
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="mt-3">
          <PrimaryButton type="submit">{t.search}</PrimaryButton>
        </div>
      </form>

      {showChip ? (
        <p className="mt-4 inline-flex min-h-tap items-center border border-line bg-paper px-3 font-semibold text-ink">
          {t.understood}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <SecondaryButton
          type="button"
          className={view === "list" ? "border-stamp bg-stamp text-white hover:bg-stamp-dark" : ""}
          onClick={() => setView("list")}
        >
          {t.list}
        </SecondaryButton>
        <SecondaryButton
          type="button"
          className={view === "map" ? "border-stamp bg-stamp text-white hover:bg-stamp-dark" : ""}
          onClick={() => setView("map")}
        >
          {t.map}
        </SecondaryButton>
      </div>

      <div className="mt-6">
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
    </PageShell>
  );
}
