import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

export type CurrencyCode = "MXN" | "USD";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rate: number | null;
  isLoading: boolean;
  error: string | null;
  convertAmount: (amountInMXN: number) => number;
  convertToMXN: (amountInDisplayCurrency: number) => number;
  formatMoney: (amountInMXN: number) => string;
  /** Converts an amount between two currency codes using the live MXN<->USD rate. */
  convert: (amount: number, from: CurrencyCode, to: CurrencyCode) => number;
  /**
   * Formats a fixed, DB-denominated amount (service price, presupuesto,
   * payment, offer) in its own currency — never reconverted by the
   * Settings-selected display currency. Use this instead of formatMoney
   * for anything whose value is fixed in the database.
   */
  formatFixedMoney: (amount: number, currencyCode?: string | null) => string;
  refreshRate: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "servease-currency";
const RATE_STORAGE_KEY = "servease-currency-rate";
const RATE_TIMESTAMP_KEY = "servease-currency-rate-ts";

const RATE_TTL_MS = 60 * 60 * 1000; // 1 hour
const DEFAULT_RATE_USD = 0.055; // Fallback MXN → USD
const EXCHANGE_API_URL = "https://api.exchangerate-api.com/v4/latest/MXN";

interface ExchangeApiResponse {
  rates: Record<string, number>;
}

async function fetchLatestRate(): Promise<number> {
  const response = await fetch(EXCHANGE_API_URL);
  if (!response.ok) {
    throw new Error(`Exchange API error: ${response.status}`);
  }
  const data = (await response.json()) as ExchangeApiResponse;
  const usdRate = data.rates?.USD;
  if (!usdRate || typeof usdRate !== "number" || usdRate <= 0) {
    throw new Error("Invalid exchange rate response");
  }
  return usdRate;
}

function loadSavedRate(): { rate: number; isStale: boolean } | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(RATE_STORAGE_KEY);
  const savedTs = localStorage.getItem(RATE_TIMESTAMP_KEY);
  if (!saved || !savedTs) return null;
  const rate = Number(saved);
  const ts = Number(savedTs);
  if (Number.isNaN(rate) || Number.isNaN(ts) || rate <= 0) return null;
  const isStale = Date.now() - ts > RATE_TTL_MS;
  return { rate, isStale };
}

function saveRate(rate: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RATE_STORAGE_KEY, String(rate));
  localStorage.setItem(RATE_TIMESTAMP_KEY, String(Date.now()));
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window === "undefined") return "MXN";
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
    return stored === "USD" || stored === "MXN" ? stored : "MXN";
  });

  const [rate, setRate] = useState<number | null>(() => {
    const saved = loadSavedRate();
    return saved && !saved.isStale ? saved.rate : null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    const saved = loadSavedRate();
    return !saved || saved.isStale;
  });
  const [error, setError] = useState<string | null>(null);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const handleRateError = useCallback(
    (err: unknown, saved: ReturnType<typeof loadSavedRate>) => {
      const fallbackRate = saved?.rate ?? DEFAULT_RATE_USD;
      setRate(fallbackRate);
      setError(
        err instanceof Error ? err.message : "Failed to fetch exchange rate",
      );
      if (saved) {
        saveRate(saved.rate); // refresh timestamp so we don't retry constantly
      }
    },
    [],
  );

  const refreshRate = useCallback(async () => {
    const saved = loadSavedRate();
    if (saved && !saved.isStale) {
      setRate(saved.rate);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const usdRate = await fetchLatestRate();
      setRate(usdRate);
      saveRate(usdRate);
    } catch (err) {
      handleRateError(err, loadSavedRate());
    } finally {
      setIsLoading(false);
    }
  }, [handleRateError]);

  useEffect(() => {
    const saved = loadSavedRate();
    if (saved && !saved.isStale) {
      return;
    }

    let cancelled = false;
    fetchLatestRate()
      .then((usdRate) => {
        if (cancelled) return;
        setRate(usdRate);
        saveRate(usdRate);
      })
      .catch((err) => {
        if (cancelled) return;
        handleRateError(err, loadSavedRate());
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [handleRateError]);

  const effectiveRate = rate ?? DEFAULT_RATE_USD;

  const convertAmount = useCallback(
    (amountInMXN: number) => {
      if (currency === "MXN") return amountInMXN;
      return amountInMXN * effectiveRate;
    },
    [currency, effectiveRate],
  );

  const convertToMXN = useCallback(
    (amountInDisplayCurrency: number) => {
      if (currency === "MXN") return amountInDisplayCurrency;
      return amountInDisplayCurrency / effectiveRate;
    },
    [currency, effectiveRate],
  );

  const formatMoney = useCallback(
    (amountInMXN: number) => {
      const value = convertAmount(amountInMXN);
      return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} ${currency}`;
    },
    [convertAmount, currency],
  );

  const convert = useCallback(
    (amount: number, from: CurrencyCode, to: CurrencyCode) => {
      if (from === to) return amount;
      if (from === "MXN" && to === "USD") return amount * effectiveRate;
      if (from === "USD" && to === "MXN") return amount / effectiveRate;
      return amount;
    },
    [effectiveRate],
  );

  const formatFixedMoney = useCallback(
    (amount: number, currencyCode?: string | null) => {
      const code: CurrencyCode = currencyCode === "USD" ? "USD" : "MXN";
      return `$${amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} ${code}`;
    },
    [],
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      rate,
      isLoading,
      error,
      convertAmount,
      convertToMXN,
      formatMoney,
      convert,
      formatFixedMoney,
      refreshRate,
    }),
    [
      currency,
      setCurrency,
      rate,
      isLoading,
      error,
      convertAmount,
      convertToMXN,
      formatMoney,
      convert,
      formatFixedMoney,
      refreshRate,
    ],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
