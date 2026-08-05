import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  fetchAreasTrabajo,
  updateAreasTrabajo,
  type AreaTrabajo,
} from "../api/userApi";

interface WorkAreasContextValue {
  areas: AreaTrabajo[];
  isLoading: boolean;
  refresh: () => void;
  update: (categoriaIds: number[]) => Promise<void>;
}

const WorkAreasContext = createContext<WorkAreasContextValue | null>(null);

export const WorkAreasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const isProvider = user?.role === "provider";

  const [areas, setAreas] = useState<AreaTrabajo[]>([]);
  const [isLoading, setIsLoading] = useState(isProvider);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!isProvider) return;

    let cancelled = false;
    fetchAreasTrabajo()
      .then((data) => {
        if (!cancelled) setAreas(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isProvider, refreshToken]);

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  const update = useCallback(
    async (categoriaIds: number[]) => {
      const previous = areas;
      try {
        const updated = await updateAreasTrabajo(categoriaIds);
        setAreas(updated);
      } catch {
        setAreas(previous);
        throw new Error("update_areas_failed");
      }
    },
    [areas],
  );

  return (
    <WorkAreasContext.Provider
      value={{ areas, isLoading, refresh, update }}
    >
      {children}
    </WorkAreasContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkAreas = (): WorkAreasContextValue => {
  const ctx = useContext(WorkAreasContext);
  if (!ctx) {
    throw new Error("useWorkAreas must be used inside WorkAreasProvider");
  }
  return ctx;
};
