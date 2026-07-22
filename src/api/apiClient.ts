import { supabase } from "../lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) throw new Error("Falta VITE_API_BASE_URL en .env");

export async function apiGet<T>(path: string): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("No hay sesión activa");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Request failed: ${response.status} ${detail}`);
  }

  return response.json();
}

export class ApiError extends Error {}

export async function apiPostPublic<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      (data && (data.detail || Object.values(data)[0])) ??
      `Request failed: ${response.status}`;
    throw new ApiError(String(Array.isArray(detail) ? detail[0] : detail));
  }

  return data as T;
}
