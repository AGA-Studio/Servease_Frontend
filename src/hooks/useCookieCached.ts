import { useCallback, useEffect, useRef, useState } from "react";
import { getCookie, setCookie } from "../lib/cookieUtils";

interface InternalState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface CookieCachedState<T> extends InternalState<T> {
  reload: () => void;
}

interface UseCookieCachedOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  maxAgeSecs: number;
  enabled?: boolean;
}

export function useCookieCached<T>({
  key,
  fetcher,
  maxAgeSecs,
  enabled = true,
}: UseCookieCachedOptions<T>): CookieCachedState<T> {
  const [state, setState] = useState<InternalState<T>>(() => {
    if (!enabled) return { data: null, loading: false, error: null };
    const cached = getCookie<T>(key);
    return {
      data: cached,
      loading: !cached,
      error: null,
    };
  });

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchFresh = useCallback(async () => {
    try {
      const fresh = await fetcherRef.current();
      if (fresh !== undefined && fresh !== null) {
        setCookie(key, fresh, maxAgeSecs);
      }
      setState({ data: fresh, loading: false, error: null });
      return fresh;
    } catch (err) {
      setState((prev) => ({
        data: prev.data,
        loading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      }));
      return undefined;
    }
  }, [key, maxAgeSecs]);

  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const cached = getCookie<T>(key);
    if (cached) {
      setState({ data: cached, loading: false, error: null });
    }
    fetchFresh();
  }, [key, enabled, fetchFresh, reloadToken]);

  return { ...state, reload };
}
