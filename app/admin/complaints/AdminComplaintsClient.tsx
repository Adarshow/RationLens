"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { PageContainer, PageTitle, CardGrid } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Complaint = {
  id: string;
  category: string;
  description: string | null;
  status: string;
  created_at: string;
  shops: { name: string } | null;
  profiles: { name: string | null } | null;
};

type Props = {
  initialComplaints: Complaint[];
};

export function AdminComplaintsClient({ initialComplaints }: Props) {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState(initialComplaints);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "overcharging": return t.categoryOvercharging;
      case "wrong_stock": return t.categoryWrongStock;
      case "behavior": return t.categoryBehavior;
      default: return t.categoryOther;
    }
  };

  async function handleResolve(id: string) {
    setError("");
    setPending((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch("/api/admin/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "resolved" }),
      });
      if (res.ok) {
        // Optimistic UI update
        setComplaints(prev => {
          const updated = prev.map(c => c.id === id ? { ...c, status: "resolved" } : c);
          const open = updated.filter(c => c.status === "open");
          const resolved = updated.filter(c => c.status === "resolved");
          return [...open, ...resolved];
        });
      } else {
        setError("Failed to resolve complaint.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setPending((p) => ({ ...p, [id]: false }));
    }
  }

  return (
    <PageContainer>
      <TextLink href="/dashboard">{t.back}</TextLink>
      <div className="mt-3">
        <PageTitle>{t.adminComplaintsQueue}</PageTitle>
      </div>

      {error ? (
        <Card variant="alert" tone="danger" role="alert" className="mt-6">
          <p className="text-laterite">{error}</p>
        </Card>
      ) : null}
      
      {complaints.length === 0 ? (
        <Card className="mt-6 text-center py-12">
          <p className="text-ink/70">{t.noComplaintsFound}</p>
        </Card>
      ) : (
        <CardGrid className="mt-6">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-bold text-ink text-lg line-clamp-2">
                    {complaint.shops?.name || t.unknownName}
                  </h3>
                  <StatusBadge 
                    tone={complaint.status === 'open' ? 'danger' : 'success'} 
                    label={complaint.status === 'open' ? t.open : t.resolved} 
                  />
                </div>
                
                <p className="mt-2 text-sm font-semibold text-ink/80">
                  {getCategoryLabel(complaint.category)}
                </p>

                {complaint.description ? (
                  <p className="mt-2 text-sm text-ink bg-paper-dim/50 p-2 rounded border border-paper-dim whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-col gap-1 text-xs text-ink/60 border-t border-paper-dim pt-3">
                  <p>{t.reportedBy}: {complaint.profiles?.name || t.unknownName}</p>
                  <p>{t.dateLabel}: {formatDistanceToNow(new Date(complaint.created_at), { addSuffix: true })}</p>
                </div>
              </div>

              {complaint.status === 'open' ? (
                <div className="flex flex-col gap-2 mt-auto pt-4">
                  <Button 
                    type="button" 
                    fullWidth={false}
                    disabled={pending[complaint.id]} 
                    onClick={() => handleResolve(complaint.id)}
                  >
                    {t.markResolved}
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </CardGrid>
      )}
    </PageContainer>
  );
}
