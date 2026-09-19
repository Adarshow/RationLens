"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer, PageTitle, CardGrid } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { TextLink } from "@/components/TextLink";
import { useLanguage } from "@/components/LanguageProvider";

type Shopkeeper = {
  id: string;
  name: string | null;
  phone: string | null;
  license_number: string | null;
  imageUrl: string | null;
};

type Shop = {
  id: string;
  name: string;
};

type Props = {
  shopkeepers: Shopkeeper[];
  shops: Shop[];
};

export function AdminShopkeepersClient({ shopkeepers, shops }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedShops, setSelectedShops] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  async function handleApprove(id: string) {
    const shopId = selectedShops[id];
    if (!shopId) {
      alert("Please select a shop first.");
      return;
    }

    setError("");
    setPending((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch("/api/admin/shopkeepers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: id, shop_id: shopId }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError(t.approvalFailed);
      }
    } finally {
      setPending((p) => ({ ...p, [id]: false }));
    }
  }

  async function handleReject(id: string) {
    if (!confirm(t.confirmReject)) return;
    
    setError("");
    setPending((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch("/api/admin/shopkeepers/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError(t.rejectionFailed);
      }
    } finally {
      setPending((p) => ({ ...p, [id]: false }));
    }
  }

  return (
    <PageContainer>
      <TextLink href="/dashboard">{t.back}</TextLink>
      <div className="mt-3">
        <PageTitle>{t.shopkeeperQueueTitle}</PageTitle>
      </div>
      
      {error ? (
        <Card variant="alert" tone="danger" role="alert" className="mt-6">
          <p className="text-laterite">{error}</p>
        </Card>
      ) : null}

      {shopkeepers.length === 0 ? (
        <Card className="mt-6 text-center py-12">
          <p className="text-ink/70">{t.noPendingApplications}</p>
        </Card>
      ) : (
        <CardGrid className="mt-6">
          {shopkeepers.map((sk) => (
            <Card key={sk.id} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <h3 className="font-bold text-ink">{sk.name || t.unknownName}</h3>
                <p className="text-sm text-ink/70">{t.phoneLabel}: {sk.phone}</p>
                <p className="text-sm text-ink/70">{t.licenseLabel}: {sk.license_number}</p>
              </div>

              {sk.imageUrl ? (
                <div className="rounded-lg overflow-hidden border border-paper-dim max-h-48 flex items-center justify-center bg-paper">
                  <img src={sk.imageUrl} alt="License proof" className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="bg-paper border border-paper-dim rounded-lg p-4 text-center">
                  <p className="text-sm text-ink/50">{t.noProofImage}</p>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-paper-dim">
                <Select
                  id={`shop-${sk.id}`}
                  label={t.assignShop}
                  value={selectedShops[sk.id] || ""}
                  onChange={(e) => setSelectedShops((s) => ({ ...s, [sk.id]: e.target.value }))}
                >
                  <option value="" disabled>{t.selectAShop}</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </Select>
                
                <div className="flex gap-2 mt-2">
                  <Button 
                    type="button" 
                    fullWidth 
                    disabled={pending[sk.id]} 
                    onClick={() => handleApprove(sk.id)}
                  >
                    {t.approve}
                  </Button>
                  <Button 
                    type="button" 
                    variant="danger" 
                    fullWidth 
                    disabled={pending[sk.id]} 
                    onClick={() => handleReject(sk.id)}
                  >
                    {t.reject}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </CardGrid>
      )}
    </PageContainer>
  );
}
