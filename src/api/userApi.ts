import { apiGet, apiPatch, apiPost, apiPut } from "./apiClient";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../context/AuthContext";
import type { ServicioListItem, UltimaOferta } from "./servicioApi";

export interface UserProfile {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  url_foto_perfil: string | null;
  descripcion_perfil: string | null;
  fecha_registro: string;
  fecha_nacimiento: string | null;
  rol: UserRole;
  correo: string;
  celular: string | null;
  estado: boolean;
  segundo_nombre: string | null;
  id_categoria: number | null;
  id_empresa: number | null;
}

interface UsuarioResponse {
  id_usuario: string;
  nombre: string;
  segundo_nombre: string | null;
  apellido_pa: string;
  apellido_ma: string | null;
  correo: string;
  celular: string | null;
  fecha_nacimiento: string | null;
  url_foto_perfil: string | null;
  descripcion_perfil: string | null;
  fecha_registro: string;
  estado: boolean;
  rol: UserRole;
  id_categoria: number | null;
  id_empresa: number | null;
}

function mapUsuarioResponse(data: UsuarioResponse): UserProfile {
  return {
    id: data.id_usuario,
    nombre: data.nombre,
    apellido_paterno: data.apellido_pa,
    apellido_materno: data.apellido_ma,
    url_foto_perfil: data.url_foto_perfil,
    descripcion_perfil: data.descripcion_perfil,
    fecha_registro: data.fecha_registro,
    fecha_nacimiento: data.fecha_nacimiento,
    rol: data.rol,
    correo: data.correo,
    celular: data.celular,
    estado: data.estado,
    segundo_nombre: data.segundo_nombre,
    id_categoria: data.id_categoria,
    id_empresa: data.id_empresa,
  };
}

export async function fetchUserProfileOrThrow(): Promise<UserProfile> {
  const data = await apiGet<UsuarioResponse>("/api/usuarios/auth/");
  return mapUsuarioResponse(data);
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    return await fetchUserProfileOrThrow();
  } catch (error) {
    console.error("fetchUserProfile failed:", error);
    return null;
  }
}

export interface UpdatePersonalInfoPayload {
  nombre?: string;
  segundo_nombre?: string;
  apellido_pa?: string;
  apellido_ma?: string;
  celular?: string;
  descripcion_perfil?: string;
}

export async function updatePersonalInfo(
  payload: UpdatePersonalInfoPayload,
): Promise<UserProfile> {
  const data = await apiPatch<UsuarioResponse>(
    "/api/usuarios/auth/personal-info/",
    { ...payload },
  );
  return mapUsuarioResponse(data);
}

export async function requestPasswordReset(): Promise<void> {
  await apiPost<void>("/api/usuarios/settings/password-reset/", {});
}

export async function fetchDisponibilidad(): Promise<boolean> {
  const data = await apiGet<{ disponible: boolean }>(
    "/api/usuarios/disponibilidad/",
  );
  return data.disponible;
}

export async function updateDisponibilidad(disponible: boolean): Promise<void> {
  await apiPatch<void>("/api/usuarios/disponibilidad/", { disponible });
}

export interface AreaTrabajo {
  id_categoria: number;
  nombre: string;
}

export async function fetchAreasTrabajo(): Promise<AreaTrabajo[]> {
  return apiGet<AreaTrabajo[]>("/api/usuarios/areas-trabajo/");
}

export async function fetchCategoriasProveedor(
  userId: string,
): Promise<AreaTrabajo[]> {
  return apiGet<AreaTrabajo[]>(`/api/usuarios/${userId}/categorias/`);
}

export async function updateAreasTrabajo(
  categorias: number[],
): Promise<AreaTrabajo[]> {
  return apiPut<AreaTrabajo[]>("/api/usuarios/areas-trabajo/", { categorias });
}

export interface PerfilCliente {
  id_usuario: string;
  nombre: string;
  url_foto_perfil: string | null;
  descripcion_perfil: string | null;
  fecha_registro: string;
  num_publicaciones: number;
  rating: number;
  num_reviews: number;
}

export async function fetchPerfilCliente(
  userId: string,
): Promise<PerfilCliente> {
  return apiGet<PerfilCliente>(`/api/usuarios/${userId}/perfil-cliente/`);
}

export interface PerfilProveedor {
  id_usuario: string;
  nombre: string;
  url_foto_perfil: string | null;
  fecha_registro: string;
  rating: number | null;
  num_reviews: number;
  trabajos_completados: number;
  descripcion_perfil: string | null;
}

export async function fetchPerfilProveedor(
  userId: string,
): Promise<PerfilProveedor> {
  return apiGet<PerfilProveedor>(`/api/usuarios/${userId}/perfil-proveedor/`);
}

export interface ReviewCliente {
  id_calificacion: number;
  cliente_id: string;
  puntuacion: number;
  comentario: string | null;
  fecha: string;
  nombre_evaluador: string;
  foto_evaluador: string | null;
}

export async function fetchReviewsCliente(
  userId: string,
): Promise<ReviewCliente[]> {
  return apiGet<ReviewCliente[]>(`/api/usuarios/${userId}/reviews/`);
}

export interface ServicioCliente {
  id_servicio: number;
  titulo: string;
  descripcion: string;
  precio_inicial: string;
  latitud: string | null;
  longitud: string | null;
  fecha: string;
  estado: string;
  imagenes: string[];
  fecha_final: string | null;
  id_cliente: string;
  id_categoria: number;
}

export async function fetchUltimasPublicacionesCliente(
  userId: string,
): Promise<ServicioCliente[]> {
  return apiGet<ServicioCliente[]>(
    `/api/usuarios/${userId}/ultimas-publicaciones/`,
  );
}

export interface HomeCliente {
  id_servicio: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  latitud: string | null;
  longitud: string | null;
  fecha: string;
  tiempo_transcurrido: string;
  estado: string;
  cliente_id: string;
  fotos_proveedores_aplicantes: string[];
}

export async function fetchHomeCliente(userId: string): Promise<HomeCliente[]> {
  return apiGet<HomeCliente[]>(`/api/usuarios/${userId}/home/`);
}

export interface MisPublicacionesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ServicioListItem[];
}

export async function fetchMisPublicaciones(
  userId: string,
  params: {
    page?: number;
    pageSize?: number;
    categoriaId?: number;
    estadoIds?: number[];
    search?: string;
  } = {},
): Promise<MisPublicacionesResponse> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.pageSize ?? 8));
  if (params.categoriaId) qs.set("categoria_id", String(params.categoriaId));
  if (params.estadoIds?.length) qs.set("estado_id", params.estadoIds.join(","));
  if (params.search?.trim()) qs.set("search", params.search.trim());
  return apiGet<MisPublicacionesResponse>(
    `/api/usuarios/${userId}/mis-publicaciones/?${qs.toString()}`,
  );
}

export interface TrabajoAplicado {
  id_postulacion: number;
  id_servicio: number;
  titulo: string;
  estado: string;
  categoria: string;
  fecha_publicacion: string;
  tiempo_transcurrido: string;
  precio_final: string;
  moneda: string | null;
  foto: string | null;
  ultima_oferta: UltimaOferta | null;
  penultima_oferta_monto: string | null;
  trabajo_terminado: boolean;
}

export interface TrabajoDisponible {
  id_servicio: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  categoria_id: number;
  latitud_aprox: string;
  longitud_aprox: string;
  fecha: string;
  tiempo_transcurrido: string;
  precio_inicial: string;
  moneda: string | null;
  estado_id: number;
  num_postulantes: number;
  foto: string | null;
}

export interface TrabajosDisponiblesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TrabajoDisponible[];
}

export async function fetchTrabajosDisponibles(params: {
  page?: number;
  pageSize?: number;
  categoriaId?: number;
} = {}): Promise<TrabajosDisponiblesResponse> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.pageSize ?? 10));
  if (params.categoriaId !== undefined) {
    qs.set("categoria_id", String(params.categoriaId));
  }
  return apiGet<TrabajosDisponiblesResponse>(
    `/api/usuarios/trabajos-disponibles/?${qs.toString()}`,
  );
}

export async function fetchTrabajosAplicados(filters?: {
  estadoId?: number;
  categoriaId?: number;
}): Promise<TrabajoAplicado[]> {
  const qs = new URLSearchParams();
  if (filters?.estadoId !== undefined) qs.set("estado_id", String(filters.estadoId));
  if (filters?.categoriaId !== undefined) qs.set("categoria_id", String(filters.categoriaId));
  const suffix = qs.toString();
  return apiGet<TrabajoAplicado[]>(
    `/api/usuarios/trabajos-aplicados/${suffix ? `?${suffix}` : ""}`,
  );
}

export async function uploadProfilePhoto(
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `user_${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("profile_photos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("profile_photos").getPublicUrl(path);

  await apiPatch("/api/usuarios/auth/", { url_foto_perfil: publicUrl });

  return publicUrl;
}
