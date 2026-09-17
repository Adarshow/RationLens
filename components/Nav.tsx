"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/cn";

type NavItem = { href: string; label: string };

export function Nav() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const isShopkeeper = pathname.startsWith("/shopkeeper");

  const items: NavItem[] = isShopkeeper
    ? [
        { href: "/shopkeeper", label: t.stockSection },
        { href: "/shopkeeper/upload", label: t.updatePhoto },
        { href: "/shopkeeper/history", label: t.history },
      ]
    : [
        { href: "/dashboard", label: t.nearbyShops },
        { href: "/notifications", label: t.notifications },
        { href: "/login", label: t.login },
      ];

  function isActive(href: string) {
    if (href === "/shopkeeper") return pathname === "/shopkeeper";
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/shops/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="border-b border-paper-dim bg-paper">
      <div className="mx-auto flex max-w-xl flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex min-h-tap items-center text-lg font-extrabold text-ink"
          >
            {t.appName}
          </Link>
          <div
            className="flex overflow-hidden rounded-lg border border-paper-dim"
            role="group"
            aria-label={t.language}
          >
            <button
              type="button"
              className={cn(
                "min-h-tap min-w-11 px-3 text-sm font-semibold",
                lang === "en"
                  ? "bg-backwater text-white"
                  : "bg-paper text-ink/70",
              )}
              onClick={() => setLang("en")}
            >
              En
            </button>
            <button
              type="button"
              className={cn(
                "min-h-tap min-w-11 px-3 text-sm font-semibold",
                lang === "ml"
                  ? "bg-backwater text-white"
                  : "bg-paper text-ink/70",
              )}
              onClick={() => setLang("ml")}
            >
              Ml
            </button>
          </div>
        </div>
        <nav aria-label="Main">
          <ul className="flex gap-1 overflow-x-auto">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-tap items-center rounded-lg px-3 text-sm font-semibold",
                      active
                        ? "bg-backwater text-white"
                        : "text-ink/70 hover:bg-paper-dim hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
