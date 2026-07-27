import { apiGet } from "./apiClient";

export interface Categoria {
  id_categoria: number;
  nombre: string;
}

export async function fetchCategorias(): Promise<Categoria[]> {
  return apiGet<Categoria[]>("/api/usuarios/categorias/");
}
