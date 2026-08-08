import { apiGet, apiPost, apiDelete } from "./apiClient";
import { supabase } from "../lib/supabase";

export interface PortafolioItem {
  id_portafolio: number;
  titulo: string;
  descripcion: string | null;
  fotos: string[];
  fecha: string;
  id_proveedor: string;
  id_categoria: number;
  categoria_nombre: string;
}

export interface CreatePortafolioPayload {
  titulo: string;
  descripcion?: string;
  id_categoria: number;
  fotos?: string[];
}

export async function fetchPortafolio(
  userId: string,
): Promise<PortafolioItem[]> {
  return apiGet<PortafolioItem[]>(`/api/usuarios/${userId}/portafolio/`);
}

export async function createPortafolioItem(
  payload: CreatePortafolioPayload,
): Promise<PortafolioItem> {
  return apiPost<PortafolioItem>("/api/usuarios/portafolio/crear/", {
    titulo: payload.titulo,
    descripcion: payload.descripcion ?? "",
    id_categoria: payload.id_categoria,
    fotos: payload.fotos ?? [],
  });
}

export async function deletePortafolioItem(
  idPortafolio: number,
): Promise<void> {
  await apiDelete(`/api/usuarios/portafolio/${idPortafolio}/eliminar/`);
}

export async function uploadPortafolioPhoto(
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `user_${userId}/${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("portafolio_fotos")
    .upload(path, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("portafolio_fotos").getPublicUrl(path);

  return publicUrl;
}
