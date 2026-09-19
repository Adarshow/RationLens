"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

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

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
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

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

const chromeInner =
  "mx-auto flex w-full items-center px-4 md:max-w-3xl md:px-6 lg:max-w-6xl lg:px-8";

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();
  const isShopkeeper = pathname.startsWith("/shopkeeper");
  const isAdmin = pathname.startsWith("/admin");
  const [unreadCount, setUnreadCount] = useState(0);
  const [complaintCount, setComplaintCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isShopkeeper || isAdmin) return;
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
  }, [isShopkeeper, isAdmin, pathname]);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    void fetch("/api/admin/complaints/count")
      .then((res) => (res.ok ? res.json() : { count: 0 }))
      .then((result: { count?: number }) => {
        if (active) setComplaintCount(result.count ?? 0);
      })
      .catch(() => {
        if (active) setComplaintCount(0);
      });
    return () => {
      active = false;
    };
  }, [isAdmin, pathname]);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const items: NavItem[] = isAdmin
    ? [
        { href: "/admin/shopkeepers", label: t.adminShopkeeperQueue, icon: <BoxIcon /> },
        { href: "/admin/complaints", label: t.adminComplaintsQueue, icon: <BellIcon /> },
      ]
    : isShopkeeper
    ? [
        { href: "/shopkeeper", label: t.stockSection, icon: <BoxIcon /> },
        { href: "/shopkeeper/upload", label: t.updatePhoto, icon: <CameraIcon /> },
        { href: "/shopkeeper/history", label: t.history, icon: <ClockIcon /> },
      ]
    : [
        { href: "/", label: t.home, icon: <HomeIcon /> },
        { href: "/dashboard", label: t.nearbyShops, icon: <ShopsIcon /> },
        { href: "/rights", label: t.rightsTitle, icon: <BookIcon /> },
        { href: "/notifications", label: t.notifications, icon: <BellIcon /> },
      ];

  if (isLoggedIn || isAdmin) {
    items.push({ href: "#logout", label: t.logout, icon: <UserIcon /> });
  } else {
    items.push({ href: "/login", label: t.login, icon: <UserIcon /> });
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
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
                if (item.href === "#logout") {
                  return (
                    <li key={item.href}>
                      <button
                        onClick={signOut}
                        className={cn(
                          "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold",
                          "text-ink/70 hover:bg-paper-dim hover:text-ink"
                        )}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={cn(
                      "inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold",
                      active
                        ? "bg-backwater text-white"
                        : "text-ink/70 hover:bg-paper-dim hover:text-ink",
                    )}>
                      {item.label}
                      {(item.href === "/notifications" && unreadCount > 0) || (item.href === "/admin/complaints" && complaintCount > 0) ? (
                        <span className="rounded-full bg-laterite px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {item.href === "/notifications" ? (unreadCount > 9 ? "9+" : unreadCount) : (complaintCount > 9 ? "9+" : complaintCount)}
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
        <ul className={cn("grid", isAdmin ? "grid-cols-3" : isShopkeeper ? "grid-cols-4" : "grid-cols-5")}>
          {items.map((item) => {
            const active = isActive(item.href);
            if (item.href === "#logout") {
              return (
                <li key={item.href}>
                  <button
                    onClick={signOut}
                    className={cn(
                      "flex min-h-14 w-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold",
                      "text-ink/70",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        "text-ink/70",
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="relative line-clamp-1 text-center">
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            }
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
                    {(item.href === "/notifications" && unreadCount > 0) || (item.href === "/admin/complaints" && complaintCount > 0) ? (
                      <span className="absolute -right-3 -top-2 rounded-full bg-laterite px-1 text-[9px] font-bold text-white">
                        {item.href === "/notifications" ? (unreadCount > 9 ? "9+" : unreadCount) : (complaintCount > 9 ? "9+" : complaintCount)}
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
