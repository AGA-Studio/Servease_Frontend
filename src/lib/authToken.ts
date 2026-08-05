/**
 * Token source abstraction.
 *
 * Production: reads the Supabase session (current behavior).
 * Development (VITE_DEV_AUTH=true): reads a local JWT from localStorage,
 * bypassing Supabase entirely.
 *
 * The rest of the app (apiClient, etc.) calls this function and never
 * touches supabase.auth directly for token acquisition.
 */
import { supabase } from "./supabase";

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === "true";
const STORAGE_KEY = "servease_dev_token";

export function getAccessTokenSync(): string | null {
  if (DEV_AUTH) {
    return localStorage.getItem(STORAGE_KEY);
  }
  // Synchronous read is not possible with Supabase — return null and
  // callers must use the async version below.
  return null;
}

export async function getAccessToken(): Promise<string | null> {
  if (DEV_AUTH) {
    return localStorage.getItem(STORAGE_KEY);
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export function setDevToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearDevToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}
