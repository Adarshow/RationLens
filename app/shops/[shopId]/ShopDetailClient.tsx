"use client";

import { StockTable } from "@/components/StockTable";
import { NotifyButton } from "@/components/NotifyButton";
import { ReportComplaintForm } from "@/components/ReportComplaintForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { shopDistanceKm, type StockWithItem } from "@/lib/mockData";
import type { Shop } from "@/lib/types";
import {
  resolveUserLocation,
  useUserLocation,
} from "@/lib/useUserLocation";

type Props = {
  shop: Shop | null;
  rows: StockWithItem[];
};

export function ShopDetailClient({ shop, rows }: Props) {
  const { t } = useLanguage();
  const { location, status } = useUserLocation();
  const activeLocation = resolveUserLocation(status, location);

  if (!shop) {
    return (
      <PageContainer>
        <EmptyState title={t.shopNotFound} />
      </PageContainer>
    );
  }

  const km = shopDistanceKm(shop, activeLocation).toFixed(1);
  const maps =
    status === "granted"
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${activeLocation.latitude}%2C${activeLocation.longitude}%3B${shop.latitude}%2C${shop.longitude}`
      : `https://www.openstreetmap.org/?mlat=${shop.latitude}&mlon=${shop.longitude}#map=16/${shop.latitude}/${shop.longitude}`;

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
                (row.status === "out_of_stock" || row.status === "low_stock") &&
                row.item_id ? (
                  <NotifyButton shopId={shop.id} itemId={row.item_id} />
                ) : null
              }
            />
          </div>
          
          <div className="mt-8 border-t border-paper-dim pt-6">
            <ReportComplaintForm shopId={shop.id} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
