"use client";

import { useState } from "react";
import { StockTable } from "@/components/StockTable";
import { NotifyButton } from "@/components/NotifyButton";
import { ReportComplaintForm } from "@/components/ReportComplaintForm";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/TextLink";
import { Button } from "@/components/ui/Button";
import { AuditLogTable } from "@/components/AuditLogTable";
import { useLanguage } from "@/components/LanguageProvider";
import { shopDistanceKm, type StockWithItem } from "@/lib/mockData";
import type { Shop, StockUpdate } from "@/lib/types";
import {
  resolveUserLocation,
  useUserLocation,
} from "@/lib/useUserLocation";

type Props = {
  shop: Shop | null;
  rows: StockWithItem[];
  history: (StockUpdate & { item_name?: string | null; item_unit?: string | null })[];
};

export function ShopDetailClient({ shop, rows, history }: Props) {
  const { t } = useLanguage();
  const [showHistory, setShowHistory] = useState(false);
  const { location, status } = useUserLocation();
  const activeLocation = resolveUserLocation(status, location);

  if (!shop) {
    return (
      <PageContainer>
        <EmptyState title={t.shopNotFound} />
      </PageContainer>
    );
  }

  const kmRaw = shopDistanceKm(shop, activeLocation);
  const km = kmRaw !== null ? kmRaw.toFixed(1) : "--";
  const maps =
    status === "granted" && activeLocation
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

        {(shop.contact_person || shop.contact_phone) ? (
          <div className="mt-6">
            <SectionHeading>{t.shopContact}</SectionHeading>
            <Card className="mt-3 p-3 md:p-4">
              <div className="flex flex-col gap-1">
                {shop.contact_person ? (
                  <p className="text-sm md:text-base font-medium text-ink">
                    {t.inCharge}: {shop.contact_person}
                  </p>
                ) : null}
                {shop.contact_phone ? (
                  <a href={`tel:${shop.contact_phone}`} className="text-sm md:text-base font-medium text-backwater underline-offset-2 hover:underline">
                    {shop.contact_phone}
                  </a>
                ) : null}
              </div>
            </Card>
          </div>
        ) : null}

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
          
          {history && history.length > 0 ? (
            <div className="mt-6">
              <SectionHeading>{t.updateHistory}</SectionHeading>
              <Card variant="browse" className="mt-3">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? t.hideHistory : t.updateHistory}
                </Button>
                {showHistory ? (
                  <div className="mt-4">
                    <AuditLogTable rows={history} />
                  </div>
                ) : null}
              </Card>
            </div>
          ) : null}

          <div className="mt-6">
            <ReportComplaintForm shopId={shop.id} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
