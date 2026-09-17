import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  href?: string;
  external?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-backwater text-white hover:bg-backwater-dark",
  secondary:
    "border-2 border-backwater bg-white text-backwater hover:bg-paper-dim",
  danger: "bg-laterite text-white hover:bg-laterite-light",
  ghost: "bg-transparent text-ink hover:bg-paper-dim",
};

function buttonClass(
  variant: ButtonVariant,
  fullWidth: boolean,
  className?: string,
) {
  return cn(
    "inline-flex h-12 min-h-btn items-center justify-center rounded-lg px-5 text-center text-base font-semibold",
    "disabled:pointer-events-none disabled:opacity-60",
    fullWidth ? "w-full" : "w-auto min-w-11",
    variants[variant],
    className,
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  fullWidth = true,
  href,
  external,
  type = "button",
  ...props
}: Props) {
  const classes = buttonClass(variant, fullWidth, className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
