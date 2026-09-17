import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-xl px-4 py-4">{children}</main>;
}
