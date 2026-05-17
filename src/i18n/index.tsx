import React, { createContext, useContext, useState, useCallback } from "react";
import { es } from "./locales/es";
import { en } from "./locales/en";

export type Locale = "es" | "en";

const locales = { es, en };

export type Translations = typeof es;
export type Namespace = keyof Translations;

interface I18nContextValue {
  locale: Locale;
  toggleLocale: () => void;
  t: <N extends Namespace>(namespace: N) => Translations[N];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocale] = useState<Locale>(() => {
    return (localStorage.getItem("servease-locale") as Locale) || "es";
  });

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "es" ? "en" : "es";
      localStorage.setItem("servease-locale", next);
      return next;
    });
  }, []);

  const t = useCallback(
    <N extends Namespace>(namespace: N): Translations[N] => {
      return locales[locale][namespace];
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
