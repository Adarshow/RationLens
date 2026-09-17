"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export type RequestGroup = {
  itemId: string;
  itemName: string;
  count: number;
  oldestCreatedAt: string | null;
};

type Props = {
  shopId: string | null;
  groups: RequestGroup[];
};

export function RequestsClient({ shopId, groups }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [pendingItem, setPendingItem] = useState<string | null>(null);
  const [visible, setVisible] = useState(groups);

  async function dismiss(itemId: string) {
    if (!shopId || pendingItem) return;
    setPendingItem(itemId);
    try {
      const response = await fetch("/api/alerts/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop_id: shopId, item_id: itemId }),
      });
      if (!response.ok) return;
      setVisible((current) => current.filter((group) => group.itemId !== itemId));
      router.refresh();
    } finally {
      setPendingItem(null);
    }
  }

  return (
    <PageContainer>
      <TextLink href="/shopkeeper">{t.back}</TextLink>
      <div className="mt-3">
        <PageTitle>{t.viewRequests}</PageTitle>
      </div>
      <div className="mt-6">
        {visible.length === 0 ? (
          <Card variant="browse">
            <EmptyState title={t.noRequests} />
          </Card>
        ) : (
          <CardGrid>
            {visible.map((group) => {
              const when = group.oldestCreatedAt
                ? formatDistanceToNow(new Date(group.oldestCreatedAt), {
                    addSuffix: true,
                  })
                : "";
              return (
                <Card key={group.itemId} as="article" variant="browse">
                  <p className="font-semibold text-ink">{group.itemName}</p>
                  <p className="mt-2 text-sm text-ink/70 md:text-base">
                    {group.count} {t.waiting}
                  </p>
                  {when ? (
                    <p className="mt-1 text-sm text-ink/70 md:text-base">
                      {t.requested} {when}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Button
                      href={`/shopkeeper?item=${group.itemId}`}
                      fullWidth
                    >
                      {t.manualUpdate}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      disabled={pendingItem === group.itemId}
                      onClick={() => {
                        void dismiss(group.itemId);
                      }}
                    >
                      {t.dismiss}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </CardGrid>
        )}
      </div>
    </PageContainer>
  );
}
