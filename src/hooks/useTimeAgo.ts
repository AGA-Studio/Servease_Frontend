import { useEffect, useReducer } from "react";
import { timeAgo } from "../utils/servicio";

/**
 * Recomputes the "Xm/Xh/Xd" relative label on an interval so it keeps
 * advancing while the component stays mounted, instead of freezing at
 * whatever it was when the data was first fetched. `timeAgo(dateStr)` is
 * derived directly during render; the interval only forces a re-render.
 */
export function useTimeAgo(dateStr: string, intervalMs = 30000): string {
  const [, forceTick] = useReducer((c: number) => c + 1, 0);

  useEffect(() => {
    const id = setInterval(forceTick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return timeAgo(dateStr);
}
