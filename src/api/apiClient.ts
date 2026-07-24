import { supabase } from "../lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) throw new Error("Falta VITE_API_BASE_URL en .env");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function extractDetail(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const detail = record.detail ?? Object.values(record)[0];
    if (Array.isArray(detail)) return String(detail[0]);
    if (detail !== undefined) return String(detail);
  }
  return `Request failed: ${status}`;
}

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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(extractDetail(data, response.status), response.status);
  }

  return data as T;
}

export async function apiPost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("No hay sesión activa");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(extractDetail(data, response.status), response.status);
  }

  return data as T;
}

export async function apiPatch<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("No hay sesión activa");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(extractDetail(data, response.status), response.status);
  }

  return data as T;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("No hay sesión activa");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(extractDetail(data, response.status), response.status);
  }

  return data as T;
}

/** For public, unauthenticated endpoints (e.g. confirm-email). */
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
    throw new ApiError(extractDetail(data, response.status), response.status);
  }

  return data as T;
}

/** For public, unauthenticated endpoints that may include a file (e.g.
 * signup with an optional profile photo). Don't set Content-Type manually —
 * the browser needs to add the multipart boundary itself. */
export async function apiPostFormPublic<T>(
  path: string,
  body: FormData,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(extractDetail(data, response.status), response.status);
  }

  return data as T;
}
