import { ROUTES } from "../router/routes";
import type { Notificacion } from "../api/notificacionApi";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  // Fecha cruda (ISO); el "hace Xm/Xh/Xd" se calcula al renderizar (ver
  // LiveTimeAgo) para que siga avanzando en vez de quedarse fijo.
  date: string;
  read: boolean;
  dotColor: string;
  tipo: string;
  referenciaId: number | null;
  contextoRol: "cliente" | "proveedor" | null;
}

const DOT_COLOR = "#2EBCCC";

export function toNotificationItem(n: Notificacion): NotificationItem {
  return {
    id: n.id_notificacion,
    title: n.titulo,
    message: n.contenido ?? "",
    date: n.fecha,
    read: n.leido,
    dotColor: DOT_COLOR,
    tipo: n.tipo,
    referenciaId: n.referencia_id,
    contextoRol: n.contexto_rol,
  };
}

// Color por tipo, usado en vistas de solo lectura (actividad reciente) donde
// conviene distinguir visualmente el tipo de evento. El popover/inbox de
// notificaciones usa un solo color (no necesita diferenciar ahí).
export function dotColorForTipo(tipo: string): string {
  switch (tipo) {
    case "servicio":
      return "#2EBCCC";
    case "postulacion":
      return "#4AA825";
    case "oferta":
      return "#FFB200";
    case "mensaje":
      return "#8B5CF6";
    case "calificacion":
      return "#FF6B6B";
    default:
      return "#989898";
  }
}

// tipo/referencia_tabla/contexto_rol vienen de los triggers en Supabase
// (usuarios/models/notificacion.py no los crea, solo los expone). "servicio",
// "postulacion" y "oferta" guardan referencia_id = id_servicio, así que todas
// comparten el mismo deep-link exacto. contexto_rol dice en qué papel (cliente
// o proveedor) recibió ESTA notificación el usuario — una cuenta puede recibir
// ambos tipos (ej. proveedor que también publica servicios), así que no basta
// con el rol general de la cuenta (user.role) para decidir la pantalla.
export function resolveNotificationPath(
  notif: NotificationItem,
  role: string | undefined,
): string {
  switch (notif.tipo) {
    // El trigger de Supabase solo manda tipo="oferta" con contexto_rol
    // "proveedor" cuando el CLIENTE mandó la oferta (ver notificar_nueva_oferta)
    // — o sea, siempre que esto pase le toca al proveedor responder. Se marca
    // openCounter=1 para que MyJobsScreen abra el modal de oferta recibida en
    // vez de solo el detalle genérico del trabajo.
    case "oferta": {
      const effectiveRole =
        notif.contextoRol ?? (role === "client" ? "cliente" : "proveedor");
      if (notif.referenciaId === null) {
        return effectiveRole === "cliente" ? ROUTES.APP.MY_POST : ROUTES.APP.MY_JOBS;
      }
      return effectiveRole === "cliente"
        ? `${ROUTES.APP.MY_POST}?serviceId=${notif.referenciaId}`
        : `${ROUTES.APP.MY_JOBS}?serviceId=${notif.referenciaId}&openCounter=1`;
    }
    case "servicio":
    case "postulacion": {
      const effectiveRole =
        notif.contextoRol ?? (role === "client" ? "cliente" : "proveedor");
      const list =
        effectiveRole === "cliente" ? ROUTES.APP.MY_POST : ROUTES.APP.MY_JOBS;
      return notif.referenciaId === null
        ? list
        : `${list}?serviceId=${notif.referenciaId}`;
    }
    case "mensaje":
      return ROUTES.APP.MESSAGES;
    case "calificacion":
      return ROUTES.APP.PROFILE;
    default:
      return ROUTES.APP.HOME;
  }
}
