import { ApiError } from "../api/apiClient";

/** Backend detail messages are safe to show as-is; generic "Request failed: 500"
 * fallbacks from apiClient are not user-friendly, so those get replaced. */
export function friendlyErrorMessage(error: unknown, fallback: string): string {
  const isFriendlyDetail =
    error instanceof ApiError && !/^Request failed: \d+$/.test(error.message);
  return isFriendlyDetail ? (error as ApiError).message : fallback;
}
