// Helpers compartidos para mapear datos crudos de "servicio" (backend) a la UI.

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

// El modelo Servicio.estado es un CharField sin choices declarados en el
// backend; estos son los valores observados/documentados hasta ahora.
// "abierto" es el estado inicial real (rama main); "pendiente" se deja por
// compatibilidad con datos creados bajo el esquema anterior.
export function mapEstadoToStatus(estado: string): ServicioStatus {
  if (estado === "abierto" || estado === "pendiente") return "receiving";
  if (estado === "completado" || estado === "cerrado") return "completed";
  return "in_progress";
}

// Solo se puede editar/eliminar mientras sigue "abierto" (regla del backend
// en ServicioEditView/ServicioDeleteView).
export function isServicioEditable(estado: string): boolean {
  return estado === "abierto";
}

// PostDetails (GET /servicios/<id>/detalle/) -> JobDetails, para reusar
// JobDetailsModal tanto en Mis Publicaciones (cliente) como en el feed
// (proveedor). `location` ya viene resuelta (colonia, ciudad aproximada).
export function mapPostDetailsToJobDetails(
  details: PostDetails,
  location: string,
): JobDetails {
  return {
    id: String(details.id_servicio),
    title: details.titulo,
    category: details.categoria,
    location,
    when: "",
    urgency: "",
    postedAgo: timeAgo(details.fecha),
    price: Number(details.precio_inicial),
    priceRange: `$${Number(details.precio_inicial).toLocaleString()}`,
    description: details.descripcion,
    mainImage: details.imagenes[0] ?? "",
    thumbnails: details.imagenes,
    client: {
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
  };
}
