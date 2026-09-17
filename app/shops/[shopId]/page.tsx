"use client";

import { StockTable } from "@/components/StockTable";
import { NotifyButton } from "@/components/NotifyButton";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
        <EmptyState title={t.shopNotFound} />
      </PageShell>
    );
  }

  const rows = getStockForShop(shop.id);
  const km = shopDistanceKm(shop).toFixed(1);
  const maps = `https://www.openstreetmap.org/?mlat=${shop.latitude}&mlon=${shop.longitude}#map=16/${shop.latitude}/${shop.longitude}`;

  return (
    <PageShell>
      <TextLink href="/dashboard">{t.back}</TextLink>
      <h1 className="mt-3 text-title font-extrabold text-ink">{shop.name}</h1>
      <p className="mt-3 text-body text-ink/70">
        {shop.address} · {km} km {t.away}
      </p>
      <TextLink href={maps} external>
        {t.getDirections}
      </TextLink>
      <div className="mt-6">
        <SectionHeading>{t.stockSection}</SectionHeading>
        <div className="mt-3">
          <StockTable
            rows={rows}
            action={(row) =>
              row.status === "out_of_stock" || row.status === "low_stock" ? (
                <NotifyButton />
              ) : null
            }
          />
        </div>
      </div>
    </PageShell>
  );
}
