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

export async function fetchNotificaciones(filters?: {
  leido?: boolean;
}): Promise<Notificacion[]> {
  const qs = new URLSearchParams();
  if (filters?.leido !== undefined) qs.set("leido", String(filters.leido));
  const suffix = qs.toString();
  return apiGet<Notificacion[]>(
    `/api/usuarios/notificaciones/${suffix ? `?${suffix}` : ""}`,
  );
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
