import type { StockStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

export type StatusTone = "success" | "warning" | "danger";

const toneDot: Record<StatusTone, string> = {
  success: "bg-leaf",
  warning: "bg-marigold",
  danger: "bg-laterite",
};

const defaultLabel: Record<StatusTone, string> = {
  success: "Available",
  warning: "Limited",
  danger: "Unavailable",
};

type Props = {
  tone: StatusTone;
  label?: string;
};

export function StatusBadge({ tone, label }: Props) {
  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-2.5 py-1 text-sm font-medium text-ink">
      <span
        aria-hidden
        className={cn("h-2 w-2 shrink-0 rounded-full", toneDot[tone])}
      />
      {label ?? defaultLabel[tone]}
    </span>
  );
}

export function stockTone(status: StockStatus | null): StatusTone {
  if (status === "available") return "success";
  if (status === "out_of_stock") return "danger";
  return "warning";
}

export function stockLabel(status: StockStatus | null): string {
  if (status === "available") return "Available";
  if (status === "out_of_stock") return "Unavailable";
  if (status === "low_stock") return "Limited";
  return "Pending";
}
