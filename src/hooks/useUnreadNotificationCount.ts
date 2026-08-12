import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchUnreadNotificacionesCount,
  type Notificacion,
} from "../api/notificacionApi";
import { useRealtimeChannel } from "./useRealtimeChannel";

/**
 * Total de notificaciones no leídas del usuario autenticado. Independiente
 * de cualquier lista paginada en pantalla — así el badge nunca queda corto
 * solo porque la lista visible cargó nada más la primera página.
 */
export function useUnreadNotificationCount(refetchKey?: unknown): number {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchUnreadNotificacionesCount()
      .then((total) => {
        if (!cancelled) setCount(total);
      })
      .catch((error) => {
        console.error("fetchUnreadNotificacionesCount failed:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [user, refetchKey]);

  useRealtimeChannel<Notificacion>({
    table: "notificacion",
    event: "INSERT",
    filter: user ? `id_usuario=eq.${user.id}` : undefined,
    enabled: !!user,
    onChange: () => setCount((prev) => prev + 1),
  });

  return count;
}
