"use client";

import { AuditLogTable } from "@/components/AuditLogTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { PageContainer, PageTitle } from "@/components/ui/PageContainer";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import type { StockUpdate } from "@/lib/types";

type Props = {
  rows: StockUpdate[];
};

export function HistoryClient({ rows }: Props) {
  const { t } = useLanguage();

  return (
    <PageContainer>
      <TextLink href="/shopkeeper">{t.back}</TextLink>
      <div className="mt-3">
        <PageTitle>{t.history}</PageTitle>
      </div>
      <div className="mt-6">
        {rows.length === 0 ? (
          <Card variant="browse">
            <EmptyState title={t.noHistory} />
          </Card>
        ) : (
          <AuditLogTable rows={rows} />
        )}
      </div>
    </PageContainer>
  );
}
