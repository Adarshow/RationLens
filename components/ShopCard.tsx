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
  userLocation: UserLocation;
};

export function ShopCard({ shop, stockRows, userLocation }: Props) {
  const { lang, t } = useLanguage();
  const km = shopDistanceKm(shop, userLocation).toFixed(1);
  const pills = stockRows.slice(0, 3);

  return (
    <Card as="article" variant="browse">
      <h2 className="text-base font-bold text-ink md:text-lg">{shop.name}</h2>
      <p className="mt-1 text-sm text-ink/70 md:text-base">
        {km} km {t.away}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {pills.map((row) => (
          <StatusBadge
            key={row.id}
            tone={stockTone(row.status)}
            label={stockLabel(row.status)}
          />
        ))}
      </div>
      <ul className="mt-3 text-sm text-ink/70 md:text-base">
        {pills.map((row) => (
          <li key={`${row.id}-label`}>
            {lang === "ml"
              ? row.item.localized_names.ml ?? row.item.name
              : row.item.name}
            {": "}
            {row.quantity ?? 0} {row.item.unit}
          </li>
        ))}
      </ul>
      <Button href={`/shops/${shop.id}`} className="mt-4" fullWidth>
        {t.viewShop}
      </Button>
    </Card>
  );
}
