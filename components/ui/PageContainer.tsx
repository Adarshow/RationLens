import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: Props) {
  return (
    <main
      className={cn(
        "mx-auto w-full px-4 py-4 pb-24",
        "md:max-w-3xl md:px-6 md:py-6 md:pb-6",
        "lg:max-w-6xl lg:px-8 lg:py-8",
        className,
      )}
    >
      {children}
    </main>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-left text-xl font-extrabold text-ink md:text-2xl lg:text-3xl">
      {children}
    </h1>
  );
}

export function CardGrid({
  children,
  columns = 3,
  className,
}: {
  children: ReactNode;
  columns?: 2 | 3;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3",
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
