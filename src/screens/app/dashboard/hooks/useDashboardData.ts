import { useState, useEffect, useCallback } from "react";
import type { DashboardData } from "../../../../types/dashboard";
import { fetchDashboardData } from "../data/dashboardApi";

type FetchStatus = "idle" | "loading" | "success" | "error" | "empty";

interface UseDashboardDataReturn {
  data: DashboardData | null;
  status: FetchStatus;
  error: string | null;
  refresh: () => void;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [state, setState] = useState<{
    data: DashboardData | null;
    status: FetchStatus;
    error: string | null;
  }>({
    data: null,
    status: "loading",
    error: null,
  });
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setState((prev) => ({ ...prev, status: "loading", error: null }));
      try {
        const result = await fetchDashboardData();
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
      } catch (err) {
        if (cancelled) return;
        setState({
          data: null,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return {
    data: state.data,
    status: state.status,
    error: state.error,
    refresh,
  };
}
