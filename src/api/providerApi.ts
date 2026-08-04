import { apiGet } from "./apiClient";

export interface ProviderKpisResponse {
  activeJobs: number;
  completedJobs: number;
  earnings: number;
  rating: number;
  reviews?: number;
  activeJobsTrend?: number;
  completedJobsTrend?: number;
  earningsTrend?: number;
}

export async function fetchProviderKpis(): Promise<ProviderKpisResponse> {
  return apiGet<ProviderKpisResponse>("/api/proveedores/dashboard/kpis/");
}

interface ResumenGananciasRaw {
  proveedor_id: string;
  ganancias_esta_semana: string;
  ganancias_pendiente: string;
  ganancias_proyectado: string;
}

export interface ProviderEarningsSummaryResponse {
  thisWeek: number;
  pending: number;
  projected: number;
}

export async function fetchProviderEarningsSummary(): Promise<ProviderEarningsSummaryResponse> {
  const raw = await apiGet<ResumenGananciasRaw>("/api/usuarios/resumen-ganancias/");
  return {
    thisWeek: Number(raw.ganancias_esta_semana),
    pending: Number(raw.ganancias_pendiente),
    projected: Number(raw.ganancias_proyectado),
  };
}

interface DashboardProveedorRaw {
  proveedor_id: string;
  trabajos_activos: number;
  trabajos_activos_nuevos_semana: number;
  trabajos_activos_nuevos_semana_pasada: number;
  trabajos_activos_pct_cambio: number | null;
  trabajos_completados: number;
  completados_semana: number;
  completados_semana_pasada: number;
  completados_pct_cambio: number | null;
  ganancias_totales: number | null;
  ganancias_semana: number | null;
  ganancias_semana_pasada: number | null;
  ganancias_pct_cambio: number | null;
  promedio_calificacion: number;
  num_reviews: number;
}

export async function fetchDashboardProveedor(
  proveedorId: string,
): Promise<ProviderKpisResponse> {
  const raw = await apiGet<DashboardProveedorRaw>(
    `/api/dashboard/proveedor/${proveedorId}/`,
  );
  return {
    activeJobs: raw.trabajos_activos,
    completedJobs: raw.trabajos_completados,
    earnings: Number(raw.ganancias_totales ?? 0),
    rating: raw.promedio_calificacion,
    reviews: raw.num_reviews,
    activeJobsTrend: raw.trabajos_activos_pct_cambio ?? undefined,
    completedJobsTrend: raw.completados_pct_cambio ?? undefined,
    earningsTrend: raw.ganancias_pct_cambio ?? undefined,
  };
}
