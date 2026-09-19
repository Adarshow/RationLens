"use client";

import { StatusBadge, stockLabel, stockTone } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/components/LanguageProvider";
import type { Shop } from "@/lib/types";
import type { StockWithItem, UserLocation } from "@/lib/mockData";
import { shopDistanceKm } from "@/lib/mockData";

type Props = {
  shop: Shop;
  stockRows: StockWithItem[];
  userLocation: UserLocation | null;
};

export function ShopCard({ shop, stockRows, userLocation }: Props) {
  const { lang, t } = useLanguage();
  const kmRaw = shopDistanceKm(shop, userLocation);
  const km = kmRaw !== null ? kmRaw.toFixed(1) : "--";
  const visibleRows = stockRows.slice(0, 4);

  return (
    <Card as="article" variant="browse" className="flex h-full min-h-[19rem] flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-paper-dim pb-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-ink md:text-lg">{shop.name}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-ink/65">
            {shop.address ?? "Local ration shop"}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-backwater/10 px-2.5 py-1 text-xs font-bold tabular-nums text-backwater">
          {km === "--" ? "--" : `${km} km`}
        </span>
      </div>
      <div className="mt-4 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/50">{t.stockSection}</p>
          <p className="text-xs text-ink/50">{t.away}</p>
        </div>
        <ul className="divide-y divide-paper-dim rounded-lg border border-paper-dim bg-white">
          {visibleRows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {lang === "ml" ? row.item.localized_names.ml ?? row.item.name : row.item.name}
                </p>
                <p className="text-xs text-ink/60">
                  {row.quantity ?? 0} {row.item.unit}
                </p>
              </div>
              <StatusBadge tone={stockTone(row.status)} label={stockLabel(row.status)} />
            </li>
          ))}
        </ul>
      </div>
      <Button href={`/shops/${shop.id}`} className="mt-4" fullWidth>
        {t.viewShop}
      </Button>
    </Card>
  );
}
