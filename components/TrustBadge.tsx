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

  return (
    <p className="text-body text-muted">
      Updated {when} · Source: {source}
      {verified ? " · ✓ Verified" : ""}
    </p>
  );
}
