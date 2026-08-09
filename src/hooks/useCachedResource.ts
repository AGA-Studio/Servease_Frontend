

import { useCallback, useEffect, useState } from "react";
import { getCached, setCached } from "../lib/dataCache";

type Updater<T> = T | ((prev: T | undefined) => T);

export function useCachedResource<T>(
  key: string | null,
  fetcher: () => Promise<T>,
) {
  const [data, setDataState] = useState<T | undefined>(() =>
    key ? getCached<T>(key) : undefined,
  );
  const [isLoading, setIsLoading] = useState(data === undefined);
  const [error, setError] = useState<unknown>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const setData = useCallback(
    (updater: Updater<T>) => {
      setDataState((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (prev: T | undefined) => T)(prev)
            : updater;
        if (key) setCached(key, next);
        return next;
      });
    },
    [key],
  );

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    async function run(cacheKey: string) {
      const cached = getCached<T>(cacheKey);
      setDataState(cached);
      setIsLoading(cached === undefined);
      setError(null);

      try {
        const fresh = await fetcher();
        if (cancelled) return;
        setDataState((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(fresh)) return prev;
          setCached(cacheKey, fresh);
          return fresh;
        });
      } catch (err) {
        if (cancelled) return;
        console.error(`useCachedResource(${cacheKey}) failed:`, err);
        setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    run(key);

    return () => {
      cancelled = true;
    };

  }, [key, reloadToken]);

  return { data, setData, isLoading, error, reload };
}
