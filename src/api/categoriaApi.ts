import { apiGet } from "./apiClient";

export interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
}

// NOTA: el backend (rama feature/gaddiel) no expone ningún endpoint para
// listar categorías (no hay ruta en usuarios/urls.py ni servicios/urls.py).
// Esta función asume que se agregará en "/api/usuarios/categorias/" y
// fallará con 404 hasta entonces. Ver reporte de gaps de backend.
export async function fetchCategorias(): Promise<Categoria[]> {
  return apiGet<Categoria[]>("/api/usuarios/categorias/");
}
