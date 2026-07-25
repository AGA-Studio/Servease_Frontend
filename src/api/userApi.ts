import { apiGet, apiPatch } from "./apiClient";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../context/AuthContext";
import type { ServicioListItem } from "./servicioApi";

export interface UserProfile {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  url_foto_perfil: string | null;
  descripcion_perfil: string | null;
  fecha_registro: string;
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

// PATCH /api/usuarios/auth/personal-info/ — solo rol cliente. Todos los
// campos son opcionales (partial update); el backend regresa el usuario
// completo actualizado.
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

export interface PerfilCliente {
  id_usuario: string;
  nombre: string;
  url_foto_perfil: string | null;
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

// GET /api/usuarios/<id>/reviews/ — reviews recibidas por el cliente, más
// recientes primero (orden ya viene del backend).
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

// GET /api/usuarios/<id>/mis-publicaciones/ — todas las publicaciones del
// cliente, paginadas (DRF PageNumberPagination) y filtrables por estado y
// categoria_id. Reemplaza a ultimas-publicaciones (limitada a 5) en la
// pantalla de Mis Publicaciones.
export interface MisPublicacionesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ServicioListItem[];
}

export async function fetchMisPublicaciones(
  userId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<MisPublicacionesResponse> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.pageSize ?? 50));
  return apiGet<MisPublicacionesResponse>(
    `/api/usuarios/${userId}/mis-publicaciones/?${qs.toString()}`,
  );
}

// Sube la foto al bucket "profile_photos" (path: `user_${userId}/avatar.<ext>`,
// misma convención que ya existe en el bucket) y guarda la URL pública en el
// registro del usuario vía el backend.
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
