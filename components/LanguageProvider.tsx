"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { copy, type Lang } from "@/lib/copy";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (typeof copy)[Lang];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = copy[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return value;
}
