import type { StockStatus } from "@/lib/types";
import { statusWord } from "@/lib/mockData";

const styles: Record<string, string> = {
  available: "bg-available-bg text-available border-available",
  low_stock: "bg-low-bg text-low border-low",
  out_of_stock: "bg-out-bg text-out border-out",
  unknown: "bg-outdated-bg text-outdated border-outdated",
};

type Props = {
  status: StockStatus | null;
};

export function StatusPill({ status }: Props) {
  const key = status ?? "unknown";
  return (
    <span
      className={`inline-flex min-h-9 items-center border px-2.5 text-sm font-semibold ${styles[key]}`}
    >
      {statusWord(status)}
    </span>
  );
}
