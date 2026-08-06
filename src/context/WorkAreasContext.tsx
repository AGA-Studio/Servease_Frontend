import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  fetchAreasTrabajo,
  updateAreasTrabajo,
  type AreaTrabajo,
} from "../api/userApi";
import { useCookieCached } from "../hooks/useCookieCached";
import { setCookie } from "../lib/cookieUtils";

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

  const {
    data: areasData,
    loading,
    reload,
  } = useCookieCached<AreaTrabajo[]>({
    key: "pv-areas",
    fetcher: fetchAreasTrabajo,
    maxAgeSecs: 3600,
    enabled: isProvider,
  });

  const [areas, setAreas] = useState<AreaTrabajo[]>(areasData ?? []);

  const [prevAreasData, setPrevAreasData] = useState(areasData);
  if (areasData !== prevAreasData) {
    setPrevAreasData(areasData);
    setAreas(areasData ?? []);
  }

  const update = useCallback(
    async (categoriaIds: number[]) => {
      const previous = areas;
      try {
        const updated = await updateAreasTrabajo(categoriaIds);
        setAreas(updated);
        setCookie("pv-areas", updated, 3600);
      } catch {
        setAreas(previous);
        throw new Error("update_areas_failed");
      }
    },
    [areas],
  );

  return (
    <WorkAreasContext.Provider
      value={{
        areas,
        isLoading: loading,
        refresh: reload,
        update,
      }}
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
