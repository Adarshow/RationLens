"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { PageShell } from "@/components/PageShell";
import { SecondaryButton } from "@/components/SecondaryButton";
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
      <h1 className="mt-3 font-serif text-title">{t.notifications}</h1>
      <div className="mt-6">
        <SecondaryButton type="button" onClick={() => setEmpty((value) => !value)}>
          {empty ? t.showList : t.showEmpty}
        </SecondaryButton>
      </div>
      {rows.length === 0 ? (
        <div className="mt-6 border border-line bg-paper p-4">
          <p className="font-semibold">{t.noNotifications}</p>
          <p className="mt-2 text-body text-muted">{t.noNotificationsBody}</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.id} className="border border-line bg-paper p-4">
              <p className="text-body">{row.message}</p>
              <p className="mt-2 text-body text-muted">
                {row.created_at
                  ? formatDistanceToNow(new Date(row.created_at), {
                      addSuffix: true,
                    })
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
