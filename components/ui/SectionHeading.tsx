import type { ReactNode } from "react";

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-left text-section font-bold text-ink">
      {children}
    </h2>
  );
}
