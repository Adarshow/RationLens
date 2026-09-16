"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

export function TopBar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const isShopkeeper = pathname.startsWith("/shopkeeper");
  const roleLabel = isShopkeeper ? t.shopkeeper : t.citizen;

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-serif text-lg font-bold text-ink">
          {t.appName}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">{roleLabel}</span>
          <div
            className="flex border border-line"
            role="group"
            aria-label={t.language}
          >
            <button
              type="button"
              className={`min-h-tap min-w-11 px-2 text-sm font-semibold ${
                lang === "en" ? "bg-stamp text-white" : "bg-paper text-ink"
              }`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={`min-h-tap min-w-11 px-2 text-sm font-semibold ${
                lang === "ml" ? "bg-stamp text-white" : "bg-paper text-ink"
              }`}
              onClick={() => setLang("ml")}
            >
              ML
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
