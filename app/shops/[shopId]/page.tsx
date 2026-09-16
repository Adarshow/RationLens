"use client";

import { StockTable } from "@/components/StockTable";
import { NotifyButton } from "@/components/NotifyButton";
import { PageShell } from "@/components/PageShell";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { getShop, getStockForShop, shopDistanceKm } from "@/lib/mockData";

type Props = {
  params: { shopId: string };
};

export default function ShopDetailPage({ params }: Props) {
  const { t } = useLanguage();
  const shop = getShop(params.shopId);
  if (!shop) {
    return (
      <PageShell>
        <p className="text-body">{t.shopNotFound}</p>
      </PageShell>
    );
  }

  const rows = getStockForShop(shop.id);
  const km = shopDistanceKm(shop).toFixed(1);
  const maps = `https://www.openstreetmap.org/?mlat=${shop.latitude}&mlon=${shop.longitude}#map=16/${shop.latitude}/${shop.longitude}`;

  return (
    <PageShell>
      <TextLink href="/dashboard">{t.back}</TextLink>
      <h1 className="mt-3 font-serif text-title">{shop.name}</h1>
      <p className="mt-3 text-body text-muted">
        {shop.address} · {km} km {t.away}
      </p>
      <TextLink href={maps} external>
        {t.getDirections}
      </TextLink>
      <div className="mt-6">
        <StockTable
          rows={rows}
          action={(row) =>
            row.status === "out_of_stock" || row.status === "low_stock" ? (
              <NotifyButton />
            ) : null
          }
        />
      </div>
    </PageShell>
  );
}
