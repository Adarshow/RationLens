"use client";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CardGrid,
  PageContainer,
  PageTitle,
} from "@/components/ui/PageContainer";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import type { Notification } from "@/lib/types";

type Props = {
  rows: Notification[];
};

export function NotificationsClient({ rows }: Props) {
  const { t } = useLanguage();
  const [items, setItems] = useState(rows);
  const [pending, setPending] = useState(false);

  async function markRead(id?: string) {
    setPending(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : {}),
      });
      if (!response.ok) return;
      setItems((current) =>
        id
          ? current.map((item) =>
              item.id === id ? { ...item, read: true } : item,
            )
          : current.map((item) => ({ ...item, read: true })),
      );
    } finally {
      setPending(false);
    }
  }

  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <PageContainer>
      <TextLink href="/dashboard">{t.back}</TextLink>
      <div className="mt-3">
        <PageTitle>{t.notifications}</PageTitle>
      </div>
      {items.length === 0 ? (
        <Card variant="browse" className="mt-6">
          <EmptyState title={t.noNotifications} body={t.noNotificationsBody} />
        </Card>
      ) : (
        <>
          {unreadCount > 0 ? (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="text-sm font-semibold text-monsoon underline-offset-2 hover:underline"
                disabled={pending}
                onClick={() => void markRead()}
              >
                Mark all as read
              </button>
            </div>
          ) : null}
          <CardGrid className="mt-3">
            {items.map((row) => (
              <Card
                key={row.id}
                as="article"
                variant={row.read ? "browse" : "alert"}
                tone="success"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm md:text-base">{row.message}</p>
                  {!row.read ? (
                    <span className="shrink-0 rounded-full bg-leaf/15 px-2 py-1 text-xs font-bold text-leaf">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-ink/70 md:text-base">
                  {row.created_at
                    ? formatDistanceToNow(new Date(row.created_at), {
                        addSuffix: true,
                      })
                    : ""}
                </p>
                {!row.read ? (
                  <button
                    type="button"
                    className="mt-3 text-sm font-semibold text-monsoon underline-offset-2 hover:underline"
                    disabled={pending}
                    onClick={() => void markRead(row.id)}
                  >
                    Mark as read
                  </button>
                ) : null}
              </Card>
            ))}
          </CardGrid>
        </>
      )}
    </PageContainer>
  );
}
