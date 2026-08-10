import { useEffect, useRef } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type ChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeChannelParams<T extends object> {
  table: string;
  event?: ChangeEvent;
  /** Postgres realtime filter, e.g. "servicio_id=eq.7". Omit to receive all rows. */
  filter?: string;
  enabled?: boolean;
  onChange: (payload: RealtimePostgresChangesPayload<T>) => void;
}

/**
 * Subscribes to Supabase Realtime postgres_changes for a table while mounted.
 * RLS on the underlying table governs which rows the subscriber can actually receive.
 *
 * El socket de Realtime necesita el JWT activo (via supabase.realtime.setAuth) ANTES
 * de unirse al canal para que RLS evalúe auth.uid() correctamente; si no se espera,
 * el join se manda como anónimo y el canal termina en CLOSED sin pasar por SUBSCRIBED.
 */
export function useRealtimeChannel<T extends object>({
  table,
  event = "*",
  filter,
  enabled = true,
  onChange,
}: UseRealtimeChannelParams<T>): void {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!enabled) return;

    let isSubscribed = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let retryCount = 0;
    const topic = `realtime:${table}:${filter ?? "all"}:${Math.random().toString(36).slice(2)}`;

    const setupAndSubscribe = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (token) {
        await supabase.realtime.setAuth(token);
      } else {
        console.warn(`[realtime:${table}] sin sesión activa; se usará auth por defecto (anon)`);
      }

      if (!isSubscribed) return;

      channel = supabase
        .channel(topic)
        .on(
          "postgres_changes",
          { event, schema: "public", table, filter },
          (payload: RealtimePostgresChangesPayload<T>) => {
            console.debug(`[realtime:${table}] event received`, payload);
            onChangeRef.current(payload);
          },
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            retryCount = 0;
            console.debug(`[realtime:${table}] subscribed (filter: ${filter ?? "none"})`);
            return;
          }

          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.warn(`[realtime:${table}] ${status} (intento ${retryCount + 1})`, err ?? "");
            if (!isSubscribed) return;
            retryCount += 1;
            const delay = Math.min(1000 * 2 ** retryCount, 15000);
            retryTimer = setTimeout(() => {
              if (isSubscribed) setupAndSubscribe();
            }, delay);
          } else {
            console.warn(`[realtime:${table}] subscription status: ${status}`, err ?? "");
          }
        });
    };

    setupAndSubscribe();

    return () => {
      isSubscribed = false;
      if (retryTimer) clearTimeout(retryTimer);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, event, filter, enabled]);
}
