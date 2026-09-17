import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  external?: boolean;
};

export function TextLink({ href, children, external = false }: Props) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-tap items-center font-semibold text-monsoon hover:text-monsoon-light"
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}
