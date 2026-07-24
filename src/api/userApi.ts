import { apiGet, apiPatch } from "./apiClient";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../context/AuthContext";

export interface UserProfile {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  url_foto_perfil: string | null;
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
  fecha_registro: string;
  estado: boolean;
  rol: UserRole;
  id_categoria: number | null;
  id_empresa: number | null;
}

export async function fetchUserProfileOrThrow(): Promise<UserProfile> {
  const data = await apiGet<UsuarioResponse>("/api/usuarios/auth/");
  return {
    id: data.id_usuario,
    nombre: data.nombre,
    apellido_paterno: data.apellido_pa,
    apellido_materno: data.apellido_ma,
    url_foto_perfil: data.url_foto_perfil,
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

export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    return await fetchUserProfileOrThrow();
  } catch (error) {
    console.error("fetchUserProfile failed:", error);
    return null;
  }
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
