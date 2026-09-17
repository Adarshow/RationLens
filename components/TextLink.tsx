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
      className="inline-flex min-h-11 items-center text-sm font-semibold text-monsoon hover:text-monsoon-light md:min-h-10 md:text-base"
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}
