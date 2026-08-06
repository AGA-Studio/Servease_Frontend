import { useEffect, useRef } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type ChangeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeChannelParams<T extends Record<string, unknown>> {
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
 */
export function useRealtimeChannel<T extends Record<string, unknown>>({
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

    const channel = supabase
      .channel(`realtime:${table}:${filter ?? "all"}:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event, schema: "public", table, filter },
        (payload: RealtimePostgresChangesPayload<T>) => onChangeRef.current(payload),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, enabled]);
}
