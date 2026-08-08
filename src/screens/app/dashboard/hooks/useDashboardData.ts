import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { DashboardData } from "../../../../types/dashboard";
import {
  fetchDashboardData,
  getCachedDashboardData,
} from "../data/dashboardApi";

type FetchStatus = "idle" | "loading" | "success" | "error" | "empty";

interface UseDashboardDataReturn {
  data: DashboardData | null;
  status: FetchStatus;
  error: string | null;
  refresh: () => void;
  isLive: boolean;
}

export function useDashboardData(
  userId: string | undefined,
  areaNames?: string[],
): UseDashboardDataReturn {
  const cached = useMemo(() => getCachedDashboardData(), []);
  const hasDataRef = useRef(cached !== null);
  const [isLive, setIsLive] = useState(false);
  const [state, setState] = useState<{
    data: DashboardData | null;
    status: FetchStatus;
    error: string | null;
  }>(() => {
    if (cached) {
      return { data: cached, status: "success", error: null };
    }
    return { data: null, status: "loading", error: null };
  });
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (state.data) {
      hasDataRef.current = true;
    }
  }, [state.data]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!hasDataRef.current) {
        setState((prev) => ({ ...prev, status: "loading", error: null }));
      }
      try {
        const result = await fetchDashboardData(userId ?? "");
        if (cancelled) return;
        const isEmpty =
          result.availableJobs.length === 0 &&
          result.recentActivity.length === 0 &&
          result.kpis.length === 0;
        setState({
          data: result,
          status: isEmpty ? "empty" : "success",
          error: null,
        });
        setIsLive(true);
      } catch (err) {
        if (cancelled) return;
        setState((prev) => {
          if (prev.data) {
            return {
              ...prev,
              error: err instanceof Error ? err.message : "Unknown error",
            };
          }
          return {
            data: null,
            status: "error",
            error: err instanceof Error ? err.message : "Unknown error",
          };
        });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshToken, userId, areaNames]);

  return {
    data: state.data,
    status: state.status,
    error: state.error,
    refresh,
    isLive,
  };
}
