"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/cn";

type Props = {
  stockUpdateId: string;
  shopId: string;
  itemId: string;
};

export function ConfirmStockButtons({ stockUpdateId, shopId, itemId }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const [totalCount, setTotalCount] = useState(0);
  const [accurateCount, setAccurateCount] = useState(0);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function load() {
      // 1. Check user vote
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: voteData } = await supabase
          .from("stock_confirmations")
          .select("is_accurate")
          .eq("stock_update_id", stockUpdateId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (active && voteData) {
          setUserVote(voteData.is_accurate);
        }
      }

      // 2. Aggregate count
      const { data: allVotes } = await supabase
        .from("stock_confirmations")
        .select("is_accurate")
        .eq("stock_update_id", stockUpdateId);

      if (active && allVotes) {
        setTotalCount(allVotes.length);
        setAccurateCount(allVotes.filter((v: { is_accurate: boolean }) => v.is_accurate).length);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [stockUpdateId, supabase]);

  async function handleVote(isAccurate: boolean) {
    if (loading) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const previousVote = userVote;
    setUserVote(isAccurate);
    
    if (previousVote === null) {
      setTotalCount(t => t + 1);
      if (isAccurate) setAccurateCount(c => c + 1);
    } else if (previousVote !== isAccurate) {
      if (isAccurate) setAccurateCount(c => c + 1);
      else setAccurateCount(c => Math.max(0, c - 1));
    }

    try {
      const { error } = await supabase
        .from("stock_confirmations")
        .upsert({
          stock_update_id: stockUpdateId,
          shop_id: shopId,
          item_id: itemId,
          user_id: user.id,
          is_accurate: isAccurate,
        }, { onConflict: "stock_update_id,user_id" });

      if (error) {
        throw error;
      }
    } catch {
      setUserVote(previousVote);
      if (previousVote === null) {
        setTotalCount(t => Math.max(0, t - 1));
        if (isAccurate) setAccurateCount(c => Math.max(0, c - 1));
      } else if (previousVote !== isAccurate) {
        if (isAccurate) setAccurateCount(c => Math.max(0, c - 1));
        else setAccurateCount(c => c + 1);
      }
    } finally {
      setLoading(false);
    }
  }

  const msg = t.confirmedBy
    .replace("{n}", String(accurateCount))
    .replace("{m}", String(totalCount));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleVote(true)}
          disabled={loading || userVote === true}
          aria-label={t.confirmAccurate}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded border transition-colors",
            userVote === true 
              ? "bg-leaf/20 border-leaf text-leaf"
              : "border-paper-dim bg-paper text-ink/70 hover:bg-paper-dim"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.56l1.38-6.91A2 2 0 0 0 19.66 9H14Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => handleVote(false)}
          disabled={loading || userVote === false}
          aria-label={t.confirmInaccurate}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded border transition-colors",
            userVote === false 
              ? "bg-laterite/20 border-laterite text-laterite"
              : "border-paper-dim bg-paper text-ink/70 hover:bg-paper-dim"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.56l-1.38 6.91A2 2 0 0 0 4.34 15H10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {totalCount > 0 ? (
        <p className="text-xs font-semibold text-ink/60">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
