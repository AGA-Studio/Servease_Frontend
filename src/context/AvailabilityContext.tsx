import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import {
  fetchDisponibilidad,
  updateDisponibilidad,
} from "../api/userApi";

interface AvailabilityContextValue {
  disponible: boolean;
  isLoading: boolean;
  setDisponible: (value: boolean) => Promise<void>;
}

const AvailabilityContext = createContext<AvailabilityContextValue | null>(null);

export const AvailabilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const isProvider = user?.role === "provider";

  const [disponible, setDisponibleState] = useState(true);
  const [isLoading, setIsLoading] = useState(isProvider);

  useEffect(() => {
    if (!isProvider) return;

    let cancelled = false;
    fetchDisponibilidad()
      .then((value) => {
        if (!cancelled) setDisponibleState(value);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isProvider]);

  const setDisponible = useCallback(
    async (value: boolean) => {
      const previous = disponible;
      setDisponibleState(value);
      try {
        await updateDisponibilidad(value);
      } catch {
        setDisponibleState(previous);
        throw new Error("update_disponibilidad_failed");
      }
    },
    [disponible],
  );

  return (
    <AvailabilityContext.Provider value={{ disponible, isLoading, setDisponible }}>
      {children}
    </AvailabilityContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAvailability = (): AvailabilityContextValue => {
  const ctx = useContext(AvailabilityContext);
  if (!ctx) {
    throw new Error("useAvailability must be used inside AvailabilityProvider");
  }
  return ctx;
};
