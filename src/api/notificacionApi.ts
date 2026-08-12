import { apiGet, apiPatch } from "./apiClient";

export interface Notificacion {
  id_notificacion: number;
  id_usuario: string;
  tipo: string;
  titulo: string;
  contenido: string | null;
  leido: boolean;
  fecha: string;
  referencia_tabla: string | null;
  referencia_id: number | null;
  contexto_rol: "cliente" | "proveedor" | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FetchNotificacionesParams {
  leido?: boolean;
  page?: number;
  page_size?: number;
}

// El backend pagina 15 por página por default — no pidas todo de un jalón,
// pasa page/page_size explícito (o usa el helper de conteo si solo
// necesitas el total de no leídas).
export async function fetchNotificaciones(
  params?: FetchNotificacionesParams,
): Promise<PaginatedResponse<Notificacion>> {
  const qs = new URLSearchParams();
  if (params?.leido !== undefined) qs.set("leido", String(params.leido));
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  const suffix = qs.toString();
  return apiGet<PaginatedResponse<Notificacion>>(
    `/api/usuarios/notificaciones/${suffix ? `?${suffix}` : ""}`,
  );
}

// Total de no leídas, sin traer la lista completa — page_size:1 mantiene el
// payload minimo, solo importa el `count`.
export async function fetchUnreadNotificacionesCount(): Promise<number> {
  const { count } = await fetchNotificaciones({ leido: false, page_size: 1 });
  return count;
}

export async function marcarNotificacionLeida(
  idNotificacion: number,
): Promise<Notificacion> {
  return apiPatch<Notificacion>(
    `/api/usuarios/notificaciones/${idNotificacion}/leida/`,
    {},
  );
}

export async function marcarTodasNotificacionesLeidas(): Promise<{
  detail: string;
}> {
  return apiPatch<{ detail: string }>(
    `/api/usuarios/notificaciones/marcar-todas-leidas/`,
    {},
  );
}
