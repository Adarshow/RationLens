"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer, PageTitle, CardGrid } from "@/components/ui/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";

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
  const [selectedShops, setSelectedShops] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  async function handleApprove(id: string) {
    const shopId = selectedShops[id];
    if (!shopId) {
      alert("Please select a shop first.");
      return;
    }

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
        alert("Approval failed.");
      }
    } finally {
      setPending((p) => ({ ...p, [id]: false }));
    }
  }

  async function handleReject(id: string) {
    if (!confirm("Are you sure you want to reject this applicant?")) return;
    
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
        alert("Rejection failed.");
      }
    } finally {
      setPending((p) => ({ ...p, [id]: false }));
    }
  }

  return (
    <PageContainer>
      <PageTitle>Shopkeeper Queue</PageTitle>
      
      {shopkeepers.length === 0 ? (
        <Card className="mt-6 text-center py-12">
          <p className="text-ink/70">No pending shopkeeper applications.</p>
        </Card>
      ) : (
        <CardGrid className="mt-6">
          {shopkeepers.map((sk) => (
            <Card key={sk.id} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <h3 className="font-bold text-ink">{sk.name || "Unknown Name"}</h3>
                <p className="text-sm text-ink/70">Phone: {sk.phone}</p>
                <p className="text-sm text-ink/70">License: {sk.license_number}</p>
              </div>

              {sk.imageUrl ? (
                <div className="rounded-lg overflow-hidden border border-paper-dim max-h-48 flex items-center justify-center bg-paper">
                  <img src={sk.imageUrl} alt="License proof" className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="bg-paper border border-paper-dim rounded-lg p-4 text-center">
                  <p className="text-sm text-ink/50">No proof image provided</p>
                </div>
              )}

              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-paper-dim">
                <Select
                  id={`shop-${sk.id}`}
                  label="Assign Shop"
                  value={selectedShops[sk.id] || ""}
                  onChange={(e) => setSelectedShops((s) => ({ ...s, [sk.id]: e.target.value }))}
                >
                  <option value="" disabled>Select a shop...</option>
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
                    Approve
                  </Button>
                  <Button 
                    type="button" 
                    variant="danger" 
                    fullWidth 
                    disabled={pending[sk.id]} 
                    onClick={() => handleReject(sk.id)}
                  >
                    Reject
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
