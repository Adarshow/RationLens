import type { ReactNode } from "react";

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-left text-sm font-bold text-ink md:text-base">
      {children}
    </h2>
  );
}
