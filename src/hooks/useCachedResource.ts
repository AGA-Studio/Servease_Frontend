

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { getCached, setCached, subscribeCached } from "../lib/dataCache";

type Updater<T> = T | ((prev: T | undefined) => T);

export function useCachedResource<T>(
  key: string | null,
  fetcher: () => Promise<T>,
) {
  // useSyncExternalStore (en vez de useState) para que un setCached() externo
  // a este hook — p.ej. AppLayout marcando una notificación leída desde un
  // toast — se refleje aquí también, aunque este componente ya esté montado
  // con su propio snapshot viejo del mismo key.
  const subscribe = useCallback(
    (onChange: () => void) => (key ? subscribeCached(key, onChange) : () => {}),
    [key],
  );
  const getSnapshot = useCallback(
    () => (key ? getCached<T>(key) : undefined),
    [key],
  );
  const data = useSyncExternalStore(subscribe, getSnapshot);

  const [isLoading, setIsLoading] = useState(() =>
    key ? getCached<T>(key) === undefined : false,
  );
  const [error, setError] = useState<unknown>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const setData = useCallback(
    (updater: Updater<T>) => {
      if (!key) return;
      const prev = getCached<T>(key);
      const next =
        typeof updater === "function"
          ? (updater as (prev: T | undefined) => T)(prev)
          : updater;
      setCached(key, next);
    },
    [key],
  );

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    async function run(cacheKey: string) {
      setIsLoading(getCached<T>(cacheKey) === undefined);
      setError(null);

      try {
        const fresh = await fetcher();
        if (cancelled) return;
        const prev = getCached<T>(cacheKey);
        if (JSON.stringify(prev) !== JSON.stringify(fresh)) {
          setCached(cacheKey, fresh);
        }
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
