import { supabase } from "../lib/supabase";
import type { UserRole } from "../context/AuthContext";

const ROL_ID_TO_ROLE: Record<number, UserRole> = {
  1: "client",
  2: "provider",
  3: "admin",
};

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
  estado: string;
  segundo_nombre: string | null;
  id_categoria: number | null;
  id_empresa: number | null;
}

export async function fetchUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("usuario")
    .select("*")
    .eq("id_usuario", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchUserProfile failed:", error);
    return null;
  }
  if (!data) {
    console.warn("fetchUserProfile: no row found for user", userId);
    return null;
  }
  return {
    id: data.id_usuario,
    nombre: data.nombre,
    apellido_paterno: data.apellido_pa,
    apellido_materno: data.apellido_ma,
    url_foto_perfil: data.url_foto_perfil,
    fecha_registro: data.fecha_registro,
    rol: ROL_ID_TO_ROLE[data.id_rol] ?? "client",
    correo: data.correo,
    celular: data.celular,
    estado: data.estado,
    segundo_nombre: data.segundo_nombre,
    id_categoria: data.id_categoria,
    id_empresa: data.id_empresa,
  };
}
