import { apiGet } from "./apiClient";

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

// GET /api/usuarios/categorias/ — lista de categorías (solo id y nombre).
export async function fetchCategorias(): Promise<Categoria[]> {
  return apiGet<Categoria[]>("/api/usuarios/categorias/");
}
