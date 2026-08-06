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

export async function cancelarPostulacion(
  idPostulacion: number,
): Promise<{ detail: string }> {
  return apiPatch<{ detail: string }>(
    `/api/servicios/postulaciones/${idPostulacion}/cancelar/`,
    {},
  );
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

const CATALOG_TTL_MS = 30_000;

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

type CatalogCacheEntry = { data: PaginatedResponse<ServicioListItem>; at: number };

const catalogCache = new Map<string, CatalogCacheEntry>();
const catalogInFlight = new Map<string, Promise<PaginatedResponse<ServicioListItem>>>();

const catalogKey = (filters?: {
  categoriaId?: number;
  estado?: string;
  page?: number;
  page_size?: number;
}): string =>
  `${filters?.categoriaId ?? "all"}|${filters?.estado ?? "all"}|${filters?.page ?? 1}|${filters?.page_size ?? 10}`;

function normalizeCatalogResponse(
  data: unknown,
): PaginatedResponse<ServicioListItem> {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data as ServicioListItem[],
    };
  }
  const paginated = data as PaginatedResponse<ServicioListItem>;
  return {
    count: paginated.count ?? 0,
    next: paginated.next ?? null,
    previous: paginated.previous ?? null,
    results: Array.isArray(paginated.results) ? paginated.results : [],
  };
}

export async function fetchServiciosCatalog(filters?: {
  categoriaId?: number;
  estado?: string;
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<ServicioListItem>> {
  const key = catalogKey(filters);

  const cached = catalogCache.get(key);
  if (cached && Date.now() - cached.at < CATALOG_TTL_MS) {
    return cached.data;
  }

  const existing = catalogInFlight.get(key);
  if (existing) return existing;

  const params = new URLSearchParams();
  if (filters?.categoriaId) params.set("categoria_id", String(filters.categoriaId));
  const estado = filters?.estado;
  if (estado) params.set("estado", estado);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.page_size) params.set("page_size", String(filters.page_size));

  const url = (p: URLSearchParams) =>
    `/api/servicios/${p.toString() ? `?${p}` : ""}`;

  const promise = (async () => {
    try {
      const raw = await apiGet<unknown>(url(params));
      return normalizeCatalogResponse(raw);
    } catch (err) {
      if (estado && err instanceof ApiError && err.status === 400) {
        params.delete("estado");
        const raw = await apiGet<unknown>(url(params));
        const paginated = normalizeCatalogResponse(raw);
        paginated.results = paginated.results.filter((item) => {
          const rawItem = item as unknown as {
            estado?: string;
            estado_descripcion?: string;
          };
          return (rawItem.estado_descripcion ?? rawItem.estado) === estado;
        });
        paginated.count = paginated.results.length;
        return paginated;
      }
      throw err;
    }
  })();

  promise.then((data) => {
    catalogCache.set(key, { data, at: Date.now() });
    catalogInFlight.delete(key);
  }).catch(() => {
    catalogInFlight.delete(key);
  });

  catalogInFlight.set(key, promise);
  return promise;
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
