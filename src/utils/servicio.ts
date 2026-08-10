

import type { PostDetails } from "../api/servicioApi";
import type { JobDetails } from "../types/job";

export type ServicioStatus = "receiving" | "in_progress" | "completed";

export function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${Math.max(mins, 0)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function mapEstadoToStatus(estado: string): ServicioStatus {
  if (estado === "abierto" || estado === "pendiente") return "receiving";
  if (estado === "completado" || estado === "cerrado") return "completed";
  return "in_progress";
}

// id_estado, per servicios/models/estado.py: 1 aceptado, 2 pendiente,
// 3 rechazada, 4 progreso, 5 completado, 6 contraoferta, 7 abierto, 8 cancelado.
const ESTADO_ID_ABIERTO = 7;
const ESTADO_ID_COMPLETADO = 5;

/**
 * Prefer this over mapEstadoToStatus wherever id_estado is available — the
 * numeric id is guaranteed stable, unlike matching on the translated/free-text
 * estado_descripcion.
 */
export function mapEstadoIdToStatus(idEstado: number): ServicioStatus {
  if (idEstado === ESTADO_ID_ABIERTO) return "receiving";
  if (idEstado === ESTADO_ID_COMPLETADO) return "completed";
  return "in_progress";
}

// Buckets id_estado -> ServicioStatus para filtrar "Mis Publicaciones" en el
// backend (misma regla que mapEstadoIdToStatus: todo lo que no sea abierto
// o completado cae en "in_progress").
export const STATUS_TO_ESTADO_IDS: Record<ServicioStatus, number[]> = {
  receiving: [ESTADO_ID_ABIERTO],
  completed: [ESTADO_ID_COMPLETADO],
  in_progress: [1, 2, 3, 4, 6, 8],
};

export function isServicioEditable(estado: string): boolean {
  return estado === "abierto";
}

export function isServicioEditableById(idEstado: number): boolean {
  return idEstado === ESTADO_ID_ABIERTO;
}

export function mapPostDetailsToJobDetails(
  details: PostDetails,
  location: string,
): JobDetails {
  // El presupuesto real: precio original del cliente, o si ya hay un
  // proveedor aceptado, el precio pactado en la última oferta.
  const displayPrice =
    details.precio_acordado != null
      ? Number(details.precio_acordado)
      : Number(details.precio_inicial);
  return {
    id: String(details.id_servicio),
    title: details.titulo,
    category: details.categoria,
    location,
    latitud: details.latitud ? Number(details.latitud) : null,
    longitud: details.longitud ? Number(details.longitud) : null,
    when: "",
    urgency: "",
    fecha_final: details.fecha_final,
    postedAgo: timeAgo(details.fecha),
    price: displayPrice,
    currency: details.moneda ?? "MXN",
    priceRange: `$${displayPrice.toLocaleString()} ${details.moneda ?? "MXN"}`,
    description: details.descripcion,
    mainImage: details.imagenes[0] ?? "",
    thumbnails: details.imagenes,
    client: {
      id: details.cliente_id,
      name: details.nombre_cliente,
      avatar: details.url_foto_perfil ?? "",
      rating: details.rating_cliente,
      reviewCount: details.num_reviews_cliente,
      memberSince: details.cliente_fecha_registro
        ? new Date(details.cliente_fecha_registro).toLocaleDateString(
            "es-MX",
            { month: "short", year: "numeric" },
          )
        : "",
      jobsPosted: details.total_publicaciones_cliente,
    },
    provider: details.proveedor_asignado
      ? {
          id: details.proveedor_asignado.id_usuario,
          name: details.proveedor_asignado.nombre,
          avatar: details.proveedor_asignado.url_foto_perfil ?? "",
          rating: details.proveedor_asignado.rating,
          reviewCount: details.proveedor_asignado.num_reviews,
        }
      : null,
  };
}
