// Hook de datos con cache en memoria (stale-while-revalidate simplificado):
// si ya hay datos en cache para `key`, se muestran de inmediato (isLoading
// nunca se prende) mientras se revalida en segundo plano; si la respuesta
// nueva es igual a la que ya se mostraba, no se re-renderiza nada (sin
// parpadeo). Solo se ve un estado de carga real cuando no hay nada en
// cache todavía (primera visita, o después de invalidar).

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

  // Actualiza el estado local y la cache en el mismo paso — para usar
  // después de mutaciones (crear/editar/eliminar) que ya conocen el
  // resultado y no necesitan esperar una revalidación de red.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reloadToken]);

  return { data, setData, isLoading, error, reload };
}
