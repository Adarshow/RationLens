"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { notifications as sampleNotifications } from "@/lib/mockData";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [empty, setEmpty] = useState(false);
  const rows = empty ? [] : sampleNotifications;

  return (
    <PageShell>
      <TextLink href="/dashboard">{t.back}</TextLink>
      <h1 className="mt-3 text-title font-extrabold text-ink">
        {t.notifications}
      </h1>
      <div className="mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setEmpty((value) => !value)}
        >
          {empty ? t.showList : t.showEmpty}
        </Button>
      </div>
      {rows.length === 0 ? (
        <Card variant="browse" className="mt-6">
          <EmptyState title={t.noNotifications} body={t.noNotificationsBody} />
        </Card>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {rows.map((row) => (
            <Card key={row.id} as="li" variant="browse">
              <p className="text-body">{row.message}</p>
              <p className="mt-2 text-body text-ink/70">
                {row.created_at
                  ? formatDistanceToNow(new Date(row.created_at), {
                      addSuffix: true,
                    })
                  : ""}
              </p>
            </Card>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
