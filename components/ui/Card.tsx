import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { StatusTone } from "@/components/ui/StatusBadge";

export type CardVariant = "browse" | "alert";

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: CardVariant;
  tone?: StatusTone;
  as?: "article" | "div" | "li" | "section" | "form";
};

const toneBorder: Record<StatusTone, string> = {
  success: "border-l-leaf",
  warning: "border-l-marigold",
  danger: "border-l-laterite",
};

export function Card({
  children,
  className,
  variant = "browse",
  tone = "warning",
  as: Tag = "div",
  ...props
}: Props) {
  return (
    <Tag
      {...props}
      className={cn(
        "p-4 text-left",
        variant === "browse" &&
          "rounded-2xl bg-paper-dim shadow-card",
        variant === "alert" &&
          cn("rounded-lg border-l-4 bg-white shadow-card", toneBorder[tone]),
        className,
      )}
    >
      {children}
    </Tag>
  );
}
