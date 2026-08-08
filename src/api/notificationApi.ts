import { apiGet, apiPatch } from "./apiClient";
import { timeAgo } from "../utils/servicio";

export interface Notification {
  id_notificacion: number;
  id_usuario: string;
  tipo: string;
  titulo: string;
  contenido: string | null;
  leido: boolean;
  fecha: string;
  referencia_tabla: string | null;
  referencia_id: number | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  dotColor: string;
}

export async function fetchNotifications(
  leido?: boolean,
): Promise<Notification[]> {
  const qs = leido === undefined ? "" : `?leido=${leido}`;
  return apiGet<Notification[]>(`/api/usuarios/notificaciones/${qs}`);
}

export async function markNotificationRead(
  idNotificacion: number,
): Promise<Notification> {
  return apiPatch<Notification>(
    `/api/usuarios/notificaciones/${idNotificacion}/leida/`,
    {},
  );
}

export async function markAllNotificationsRead(): Promise<{ detail: string }> {
  return apiPatch<{ detail: string }>(
    "/api/usuarios/notificaciones/marcar-todas-leidas/",
    {},
  );
}

const NOTIF_COLORS: Record<string, string> = {
  counteroffer: "#2EBCCC",
  completed: "#4AA825",
  message: "#FFB200",
  postulacion: "#7C5CFF",
  review: "#FF9F43",
  nueva_postulacion: "#2EBCCC",
  postulacion_aceptada: "#4AA825",
  postulacion_rechazada: "#FF5555",
  nuevo_mensaje: "#FFB200",
  servicio_completado: "#4AA825",
};

export function mapNotificationToItem(n: Notification): NotificationItem {
  return {
    id: String(n.id_notificacion),
    title: n.titulo,
    message: n.contenido ?? "",
    timeAgo: timeAgo(n.fecha),
    read: n.leido,
    dotColor: NOTIF_COLORS[n.tipo] ?? "#989898",
  };
}
