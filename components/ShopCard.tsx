"use client";

import Link from "next/link";
import { StatusPill } from "@/components/StatusPill";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useLanguage } from "@/components/LanguageProvider";
import type { Shop } from "@/lib/types";
import type { StockWithItem } from "@/lib/mockData";
import { shopDistanceKm } from "@/lib/mockData";

type Props = {
  shop: Shop;
  stockRows: StockWithItem[];
};

export function ShopCard({ shop, stockRows }: Props) {
  const { lang, t } = useLanguage();
  const km = shopDistanceKm(shop).toFixed(1);
  const pills = stockRows.slice(0, 3);

  return (
    <article className="border border-line bg-paper p-4">
      <h2 className="font-serif text-xl font-semibold">{shop.name}</h2>
      <p className="mt-1 text-body text-muted">
        {km} km {t.away}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {pills.map((row) => (
          <StatusPill key={row.id} status={row.status} />
        ))}
      </div>
      <ul className="mt-3 text-body text-muted">
        {pills.map((row) => (
          <li key={`${row.id}-label`}>
            {lang === "ml" ? row.item.localized_names.ml ?? row.item.name : row.item.name}
            {": "}
            {row.quantity ?? 0} {row.item.unit}
          </li>
        ))}
      </ul>
      <Link href={`/shops/${shop.id}`} className="mt-4 block">
        <PrimaryButton type="button">{t.viewShop}</PrimaryButton>
      </Link>
    </article>
  );
}
