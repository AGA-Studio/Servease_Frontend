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
}

export async function fetchUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as UserProfile;
}
