import { formatDistanceToNow } from "date-fns";
import type { VerificationStatus } from "@/lib/types";
import { sourceLabel } from "@/lib/mockData";

type Props = {
  lastUpdatedAt: string | null;
  verificationStatus: VerificationStatus | null;
};

export function TrustBadge({ lastUpdatedAt, verificationStatus }: Props) {
  const when = lastUpdatedAt
    ? formatDistanceToNow(new Date(lastUpdatedAt), { addSuffix: true })
    : "time unknown";
  const source = sourceLabel(verificationStatus);
  const verified =
    verificationStatus === "shop_verified" ||
    verificationStatus === "ai_assisted";

  let dotColor = "bg-ink/30";
  if (verificationStatus === "shop_verified") {
    dotColor = "bg-leaf";
  } else if (verificationStatus === "ai_assisted") {
    dotColor = "bg-sun";
  }

  return (
    <p className="flex items-center gap-1.5 text-sm text-ink/70 md:text-base">
      <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>
        Updated {when} · Source: {source}
        {verified ? " · Verified" : ""}
      </span>
    </p>
  );
}
