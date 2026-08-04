import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "./apiClient";
import { supabase } from "../lib/supabase";

export interface CreateServicioPayload {
  titulo: string;
  descripcion: string;
  precio_inicial: string;
  latitud: number;
  longitud: number;
  imagenes: string[];
  id_categoria: number;

  fecha_final?: string;
  id_tipo_cambio?: number;
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
  id_tipo_cambio: number | null;
  tipo_cambio_nombre: string | null;
}

export async function createServicio(
  payload: CreateServicioPayload,
): Promise<ServicioResponse> {
  return apiPost<ServicioResponse>("/api/servicios/crear/", { ...payload });
}

export type UpdateServicioPayload = Partial<CreateServicioPayload>;

export async function editServicio(
  idServicio: number | string,
  payload: UpdateServicioPayload,
): Promise<ServicioResponse> {
  return apiPatch<ServicioResponse>(`/api/servicios/${idServicio}/editar/`, {
    ...payload,
  });
}

export async function deleteServicio(
  idServicio: number | string,
): Promise<{ detail: string }> {
  return apiDelete<{ detail: string }>(`/api/servicios/${idServicio}/eliminar/`);
}

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
  fecha_final: string | null;
}

export async function fetchPostDetails(
  idServicio: number | string,
): Promise<PostDetails> {
  const data = await apiGet<PostDetails>(`/api/servicios/${idServicio}/detalle/`);
  return data;
}

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
  const estado = filters?.estado;
  if (estado) params.set("estado", estado);

  const url = (p: URLSearchParams) =>
    `/api/servicios/${p.toString() ? `?${p}` : ""}`;

  try {
    return await apiGet<ServicioListItem[]>(url(params));
  } catch (err) {
    if (estado && err instanceof ApiError && err.status === 400) {
      params.delete("estado");
      const items = await apiGet<ServicioListItem[]>(url(params));
      return items.filter((item) => {
        const raw = item as unknown as {
          estado?: string;
          estado_descripcion?: string;
        };
        return (raw.estado_descripcion ?? raw.estado) === estado;
      });
    }
    throw err;
  }
}

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
