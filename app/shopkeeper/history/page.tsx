"use client";

import { AuditLogTable } from "@/components/AuditLogTable";
import { PageShell } from "@/components/PageShell";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { SHOPKEEPER_SHOP_ID, stockUpdates } from "@/lib/mockData";

export default function HistoryPage() {
  const { t } = useLanguage();
  const rows = stockUpdates.filter((row) => row.shop_id === SHOPKEEPER_SHOP_ID);

  return (
    <PageShell>
      <TextLink href="/shopkeeper">{t.back}</TextLink>
      <h1 className="mt-3 font-serif text-title">{t.history}</h1>
      <div className="mt-6">
        <AuditLogTable rows={rows} />
      </div>
    </PageShell>
  );
}
