import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({ children, className = "", ...props }: Props) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-tap w-full items-center justify-center bg-stamp px-5 text-base font-semibold text-white hover:bg-stamp-dark disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
