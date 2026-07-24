import { apiDelete, apiGet, apiPatch, apiPost } from "./apiClient";
import { supabase } from "../lib/supabase";

export interface CreateServicioPayload {
  titulo: string;
  descripcion: string;
  precio_inicial: string;
  latitud: number;
  longitud: number;
  imagenes: string[];
  id_categoria: number;
}

export interface ServicioResponse {
  id_servicio: number;
  titulo: string;
  descripcion: string;
  precio_inicial: string;
  latitud: string;
  longitud: string;
  fecha: string;
  estado: string;
  imagenes: string[];
  fecha_final: string | null;
  id_cliente: string;
  id_categoria: number;
}

// Rama main del backend: la creación vive en /crear/ (la raíz "/api/servicios/"
// ahora es el catálogo público GET, filtrable por categoria_id/estado).
export async function createServicio(
  payload: CreateServicioPayload,
): Promise<ServicioResponse> {
  return apiPost<ServicioResponse>("/api/servicios/crear/", { ...payload });
}

export type UpdateServicioPayload = Partial<CreateServicioPayload>;

// PATCH /api/servicios/<id>/editar/ — solo el dueño, y solo si estado === 'abierto'.
export async function editServicio(
  idServicio: number | string,
  payload: UpdateServicioPayload,
): Promise<ServicioResponse> {
  return apiPatch<ServicioResponse>(`/api/servicios/${idServicio}/editar/`, {
    ...payload,
  });
}

// DELETE /api/servicios/<id>/eliminar/ — borrado lógico (estado -> 'cancelado').
// Solo el dueño, y solo si estado === 'abierto'.
export async function deleteServicio(
  idServicio: number | string,
): Promise<{ detail: string }> {
  return apiDelete<{ detail: string }>(`/api/servicios/${idServicio}/eliminar/`);
}

// GET /api/servicios/<id>/detalle/ — vista pública (cualquier autenticado),
// no solo el dueño. Trae info completa del servicio + del cliente que lo publicó.
export interface PostDetails {
  id_servicio: number;
  titulo: string;
  latitud: string;
  longitud: string;
  fecha: string;
  estado: string;
  categoria: string;
  precio_inicial: string;
  imagenes: string[];
  descripcion: string;
  tiempo_transcurrido: string;
  cliente_id: string;
  url_foto_perfil: string | null;
  nombre_cliente: string;
  cliente_fecha_registro: string;
  rating_cliente: number;
  num_reviews_cliente: number;
  total_publicaciones_cliente: number;
}

export async function fetchPostDetails(
  idServicio: number | string,
): Promise<PostDetails> {
  return apiGet<PostDetails>(`/api/servicios/${idServicio}/detalle/`);
}

// GET /api/servicios/<id>/aplicantes/ — solo el dueño del servicio (403 si no).
export interface Aplicante {
  id_postulacion: number;
  servicio_id: number;
  estado_solicitud: string;
  precio_propuesto: string;
  mensaje_proveedor: string;
  presupuesto_acordado: string | null;
  proveedor_id: string;
  nombre_proveedor: string;
  url_foto_perfil: string | null;
  rating: number;
  num_reviews: number;
  trabajos_completados: number;
}

export async function fetchAplicantes(
  idServicio: number | string,
): Promise<Aplicante[]> {
  return apiGet<Aplicante[]>(`/api/servicios/${idServicio}/aplicantes/`);
}

// GET /api/servicios/ — catálogo público (AllowAny), filtrable por
// categoria_id y estado. Usado por el feed de trabajos del proveedor.
export interface ServicioListItem {
  id_servicio: number;
  titulo: string;
  precio_inicial: string;
  latitud: string;
  longitud: string;
  fecha: string;
  estado: string;
  imagenes: string[];
  categoria_nombre: string;
}

export async function fetchServiciosCatalog(filters?: {
  categoriaId?: number;
  estado?: string;
}): Promise<ServicioListItem[]> {
  const params = new URLSearchParams();
  if (filters?.categoriaId) params.set("categoria_id", String(filters.categoriaId));
  if (filters?.estado) params.set("estado", filters.estado);
  const query = params.toString();
  return apiGet<ServicioListItem[]>(`/api/servicios/${query ? `?${query}` : ""}`);
}

// Sube la imagen al bucket "service_images" (path: `user_${userId}/<archivo>`),
// misma convención que el backend exige en CreateServicioSerializer.validate_imagenes.
export async function uploadServiceImage(
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
  const path = `user_${userId}/${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from("service_images")
    .upload(path, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("service_images").getPublicUrl(path);

  return publicUrl;
}
