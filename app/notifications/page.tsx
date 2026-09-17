"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CardGrid,
  PageContainer,
  PageTitle,
} from "@/components/ui/PageContainer";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { notifications as sampleNotifications } from "@/lib/mockData";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [empty, setEmpty] = useState(false);
  const rows = empty ? [] : sampleNotifications;

  return (
    <PageContainer>
      <TextLink href="/dashboard">{t.back}</TextLink>
      <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageTitle>{t.notifications}</PageTitle>
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
        <CardGrid className="mt-6">
          {rows.map((row) => (
            <Card key={row.id} as="article" variant="browse">
              <p className="text-sm md:text-base">{row.message}</p>
              <p className="mt-2 text-sm text-ink/70 md:text-base">
                {row.created_at
                  ? formatDistanceToNow(new Date(row.created_at), {
                      addSuffix: true,
                    })
                  : ""}
              </p>
            </Card>
          ))}
        </CardGrid>
      )}
    </PageContainer>
  );
}
