"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/cn";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

function ShopsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5ZM10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 19.5c1.2-3 3.5-4.5 7-4.5s5.8 1.5 7 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5 12 4l8 4.5v9L12 22 4 17.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M12 12v10M4 8.5l8 3.5 8-3.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="7" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="13.5" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 7 10.2 5h3.6L15 7" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 8v4.5L15 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const chromeInner =
  "mx-auto flex w-full items-center px-4 md:max-w-3xl md:px-6 lg:max-w-6xl lg:px-8";

export function Nav() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const isShopkeeper = pathname.startsWith("/shopkeeper");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isShopkeeper) return;
    let active = true;
    void fetch("/api/notifications")
      .then((response) => (response.ok ? response.json() : { count: 0 }))
      .then((result: { count?: number }) => {
        if (active) setUnreadCount(result.count ?? 0);
      })
      .catch(() => {
        if (active) setUnreadCount(0);
      });
    return () => {
      active = false;
    };
  }, [isShopkeeper, pathname]);

  const items: NavItem[] = isShopkeeper
    ? [
        { href: "/shopkeeper", label: t.stockSection, icon: <BoxIcon /> },
        { href: "/shopkeeper/upload", label: t.updatePhoto, icon: <CameraIcon /> },
        { href: "/shopkeeper/history", label: t.history, icon: <ClockIcon /> },
      ]
    : [
        { href: "/dashboard", label: t.nearbyShops, icon: <ShopsIcon /> },
        { href: "/notifications", label: t.notifications, icon: <BellIcon /> },
        { href: "/login", label: t.login, icon: <UserIcon /> },
      ];

  function isActive(href: string) {
    if (href === "/shopkeeper") return pathname === "/shopkeeper";
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname.startsWith("/shops/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const languageToggle = (
    <div
      className="flex overflow-hidden rounded-lg border border-paper-dim"
      role="group"
      aria-label={t.language}
    >
      <button
        type="button"
        className={cn(
          "min-h-11 min-w-11 px-3 text-sm font-semibold md:min-h-10",
          lang === "en" ? "bg-backwater text-white" : "bg-paper text-ink/70",
        )}
        onClick={() => setLang("en")}
      >
        En
      </button>
      <button
        type="button"
        className={cn(
          "min-h-11 min-w-11 px-3 text-sm font-semibold md:min-h-10",
          lang === "ml" ? "bg-backwater text-white" : "bg-paper text-ink/70",
        )}
        onClick={() => setLang("ml")}
      >
        Ml
      </button>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-paper-dim bg-paper">
        <div className={cn(chromeInner, "h-14 justify-between gap-3 md:h-16")}>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-base font-extrabold text-ink md:text-lg"
          >
            {t.appName}
          </Link>
          <nav className="hidden md:block" aria-label="Main">
            <ul className="flex items-center gap-1">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={cn(
                      "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold",
                      active
                        ? "bg-backwater text-white"
                        : "text-ink/70 hover:bg-paper-dim hover:text-ink",
                    )}>
                      {item.label}
                      {item.href === "/notifications" && unreadCount > 0 ? (
                        <span className="rounded-full bg-laterite px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {languageToggle}
        </div>
      </header>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-paper-dim bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Main"
      >
        <ul className="grid grid-cols-3">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold",
                    active ? "text-backwater" : "text-ink/70",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      active ? "bg-backwater text-white" : "text-ink/70",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="relative line-clamp-1 text-center">
                    {item.label}
                    {item.href === "/notifications" && unreadCount > 0 ? (
                      <span className="absolute -right-3 -top-2 rounded-full bg-laterite px-1 text-[9px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
