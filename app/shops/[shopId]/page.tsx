"use client";

import { StockTable } from "@/components/StockTable";
import { NotifyButton } from "@/components/NotifyButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
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
      <PageContainer>
        <EmptyState title={t.shopNotFound} />
      </PageContainer>
    );
  }

  const rows = getStockForShop(shop.id);
  const km = shopDistanceKm(shop).toFixed(1);
  const maps = `https://www.openstreetmap.org/?mlat=${shop.latitude}&mlon=${shop.longitude}#map=16/${shop.latitude}/${shop.longitude}`;

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-4xl">
        <TextLink href="/dashboard">{t.back}</TextLink>
        <div className="mt-3">
          <PageTitle>{shop.name}</PageTitle>
        </div>
        <p className="mt-3 text-sm text-ink/70 md:text-base">
          {shop.address} · {km} km {t.away}
        </p>
        <TextLink href={maps} external>
          {t.getDirections}
        </TextLink>
        <div className="mt-6">
          <SectionHeading>{t.stockSection}</SectionHeading>
          <div className="mt-3">
            <StockTable
              columns={2}
              rows={rows}
              action={(row) =>
                row.status === "out_of_stock" || row.status === "low_stock" ? (
                  <NotifyButton />
                ) : null
              }
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
