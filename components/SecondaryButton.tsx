import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function SecondaryButton({
  children,
  className = "",
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-tap w-full items-center justify-center border-2 border-ink bg-paper px-5 text-base font-semibold text-ink hover:bg-line disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
