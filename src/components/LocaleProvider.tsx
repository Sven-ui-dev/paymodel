"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Locale = "de" | "en";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("de");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check localStorage first
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && (saved === "de" || saved === "en")) {
      setLocale(saved);
      return;
    }
    // Auto-detect from browser
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "en") {
      setLocale("en");
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  };

  // Prevent hydration mismatch - show nothing until mounted
  if (!mounted) {
    return (
      <LocaleContext.Provider value={{ locale: "de", setLocale: handleSetLocale }}>
        {children}
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}

// German translations
export const translations = {
  de: {
    nav: {
      home: "Home",
      pricing: "Preise",
      login: "Anmelden",
      dashboard: "Dashboard",
    },
    hero: {
      title: "Alle Modelle. Alle Preise. Ein Blick.",
      subtitle: "Aktuelle Token-Preise, Geschwindigkeit und Qualität der wichtigsten AI-Modelle im direkten Vergleich.",
      cta: "Preisvergleich",
      cta2: "Kostenrechner",
    },
    features: {
      title: "Alle Modelle. Alle Preise. Ein Blick.",
      priceComparison: "Preisvergleich",
      priceComparisonDesc: "Vergleiche Preise von über 300 AI-Modellen",
      costCalculator: "Kostenrechner",
      costCalculatorDesc: "Berechne die Kosten für deinen Use-Case",
      benchmark: "Benchmark",
      benchmarkDesc: "Teste deine Prompts gegen alle Modelle",
    },
    footer: {
      imprint: "Impressum",
      privacy: "Datenschutz",
      api: "API",
    },
    pricing: {
      title: "Preise",
      free: "Free",
      pro: "Pro",
      business: "Business",
      cta: "Jetzt starten",
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Willkommen zurück",
      logout: "Abmelden",
    },
    models: {
      search: "Modelle suchen...",
      provider: "Provider",
      inputPrice: "Input / 1M",
      outputPrice: "Output / 1M",
      context: "Kontext",
    },
    common: {
      language: "Sprache",
      german: "Deutsch",
      english: "English",
    },
  },
  en: {
    nav: {
      home: "Home",
      pricing: "Pricing",
      login: "Login",
      dashboard: "Dashboard",
    },
    hero: {
      title: "All Models. All Prices. One Look.",
      subtitle: "Current token prices, speed and quality of the most important AI models in direct comparison.",
      cta: "Price Comparison",
      cta2: "Cost Calculator",
    },
    features: {
      title: "All Models. All Prices. One Look.",
      priceComparison: "Price Comparison",
      priceComparisonDesc: "Compare prices of 300+ AI models",
      costCalculator: "Cost Calculator",
      costCalculatorDesc: "Calculate costs for your use case",
      benchmark: "Benchmark",
      benchmarkDesc: "Test your prompts against all models",
    },
    footer: {
      imprint: "Imprint",
      privacy: "Privacy",
      api: "API",
    },
    pricing: {
      title: "Pricing",
      free: "Free",
      pro: "Pro",
      business: "Business",
      cta: "Get Started",
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome back",
      logout: "Logout",
    },
    models: {
      search: "Search models...",
      provider: "Provider",
      inputPrice: "Input / 1M",
      outputPrice: "Output / 1M",
      context: "Context",
    },
    common: {
      language: "Language",
      german: "Deutsch",
      english: "English",
    },
  },
};

export function t(key: string): string {
  const { locale } = useLocale();
  const keys = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[locale];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}
