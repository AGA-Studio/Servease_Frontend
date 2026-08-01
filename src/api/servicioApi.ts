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

export interface PendienteCalificar {
  id_servicio: number;
  titulo: string;
  proveedor_nombre: string;
  proveedor_foto: string | null;
}

export async function fetchPendienteCalificar(): Promise<PendienteCalificar | null> {
  return apiGet<PendienteCalificar | null>("/api/servicios/pendiente-calificar/");
}

export async function acceptPostulacion(
  idPostulacion: number | string,
): Promise<{ detail: string }> {
  return apiPatch<{ detail: string }>(
    `/api/servicios/postulaciones/${idPostulacion}/aceptar/`,
    {},
  );
}

export async function rejectPostulacion(
  idPostulacion: number | string,
): Promise<{ detail: string }> {
  return apiPatch<{ detail: string }>(
    `/api/servicios/postulaciones/${idPostulacion}/rechazar/`,
    {},
  );
}

export async function undoRejectPostulacion(
  idPostulacion: number | string,
): Promise<{ detail: string }> {
  return apiPatch<{ detail: string }>(
    `/api/servicios/postulaciones/${idPostulacion}/deshacer-rechazo/`,
    {},
  );
}

export async function cancelPostulacion(
  idPostulacion: number | string,
): Promise<{ detail: string }> {
  return apiPatch<{ detail: string }>(
    `/api/servicios/postulaciones/${idPostulacion}/cancelar/`,
    {},
  );
}

export interface MiTrabajo {
  id_postulacion: number;
  id_servicio: number;
  titulo: string;
  categoria_nombre: string;
  imagenes: string[];
  estado: "pendiente" | "aceptada";
  servicio_estado: string;
  fecha: string;
  precio_propuesto: string;
  precio_acordado: string;
  moneda: string;
}

export async function fetchMisTrabajos(): Promise<MiTrabajo[]> {
  return apiGet<MiTrabajo[]>("/api/servicios/mis-trabajos/");
}

export interface IniciarPagoResponse {
  id_transaccion: number;
  monto: string;
  estado: string;
  client_secret: string;
}

export async function iniciarPago(
  idServicio: number | string,
): Promise<IniciarPagoResponse> {
  return apiPost<IniciarPagoResponse>(
    `/api/servicios/${idServicio}/pago/iniciar/`,
    {},
  );
}

export interface PagoEstado {
  id_transaccion: number;
  estado: string;
}

export async function fetchPagoEstado(
  idServicio: number | string,
): Promise<PagoEstado | null> {
  return apiGet<PagoEstado | null>(`/api/servicios/${idServicio}/pago/estado/`);
}

export interface PagoEnCursoProveedor {
  id_servicio: number;
  id_transaccion: number;
  estado: string;
}

export async function fetchPagoEnCursoProveedor(): Promise<PagoEnCursoProveedor | null> {
  return apiGet<PagoEnCursoProveedor | null>(
    "/api/servicios/pago/en-curso-proveedor/",
  );
}

export async function cancelarPago(
  idTransaccion: number | string,
): Promise<{ detail: string }> {
  return apiPost<{ detail: string }>(
    `/api/servicios/pago/${idTransaccion}/cancelar/`,
    {},
  );
}

export interface PagoPendienteResponse {
  id_transaccion: number;
  monto: string;
  client_secret: string;
}

export async function fetchPagoPendiente(
  idServicio: number | string,
): Promise<PagoPendienteResponse> {
  return apiGet<PagoPendienteResponse>(
    `/api/servicios/${idServicio}/pago/pendiente/`,
  );
}

export interface PagoPendienteClienteResponse {
  id_servicio: number;
  titulo: string;
  id_transaccion: number;
  monto: string;
  client_secret: string;
}

export async function fetchPagoPendienteCliente(): Promise<PagoPendienteClienteResponse | null> {
  return apiGet<PagoPendienteClienteResponse | null>(
    "/api/servicios/pago/pendiente-cliente/",
  );
}

export interface CompletarServicioPayload {
  metodo_pago: "efectivo" | "tarjeta";
  puntuacion: number;
  comentario?: string;
}

export async function completarServicio(
  idServicio: number | string,
  payload: CompletarServicioPayload,
): Promise<{ detail: string }> {
  return apiPost<{ detail: string }>(`/api/servicios/${idServicio}/completar/`, {
    ...payload,
  });
}

export interface CalificarServicioPayload {
  puntuacion: number;
  comentario?: string;
}

export async function calificarServicio(
  idServicio: number | string,
  payload: CalificarServicioPayload,
): Promise<{ detail: string }> {
  return apiPost<{ detail: string }>(`/api/servicios/${idServicio}/calificar/`, {
    ...payload,
  });
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
  if (filters?.estado) params.set("estado", filters.estado);
  const query = params.toString();
  return apiGet<ServicioListItem[]>(`/api/servicios/${query ? `?${query}` : ""}`);
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
