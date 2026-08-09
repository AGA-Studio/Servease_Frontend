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

// El backend ya no suma MXN y USD como si fueran la misma moneda: cada bucket
// viene separado por moneda del servicio (ver vista_resumen_ganancias). Aquí
// se combina cada par usando la tasa de cambio vigente (convertUsdToMxn).
interface ResumenGananciasRaw {
  proveedor_id: string;
  ganancias_esta_semana_mxn: string;
  ganancias_esta_semana_usd: string;
  ganancias_este_mes_mxn: string;
  ganancias_este_mes_usd: string;
  ganancias_pendiente_mxn: string;
  ganancias_pendiente_usd: string;
  ganancias_totales_mxn: string;
  ganancias_totales_usd: string;
  ganancias_semana_anterior_mxn: string;
  ganancias_semana_anterior_usd: string;
  ganancias_mes_anterior_mxn: string;
  ganancias_mes_anterior_usd: string;
}

export interface ProviderEarningsSummaryResponse {
  total: number;
  thisWeek: number;
  weekTrend?: number;
  thisMonth: number;
  monthTrend?: number;
  pending: number;
  projected: number;
}

const pctChange = (current: number, previous: number): number | undefined => {
  if (previous === 0) return undefined;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

export async function fetchProviderEarningsSummary(
  convertUsdToMxn: (amountUsd: number) => number,
): Promise<ProviderEarningsSummaryResponse> {
  const raw = await apiGet<ResumenGananciasRaw>("/api/usuarios/resumen-ganancias/");

  const combine = (mxn: string, usd: string) =>
    Number(mxn ?? 0) + convertUsdToMxn(Number(usd ?? 0));

  const thisWeek = combine(raw.ganancias_esta_semana_mxn, raw.ganancias_esta_semana_usd);
  const thisMonth = combine(raw.ganancias_este_mes_mxn, raw.ganancias_este_mes_usd);
  const pending = combine(raw.ganancias_pendiente_mxn, raw.ganancias_pendiente_usd);
  const total = combine(raw.ganancias_totales_mxn, raw.ganancias_totales_usd);
  const weekPrevious = combine(raw.ganancias_semana_anterior_mxn, raw.ganancias_semana_anterior_usd);
  const monthPrevious = combine(raw.ganancias_mes_anterior_mxn, raw.ganancias_mes_anterior_usd);

  return {
    total,
    thisWeek,
    weekTrend: pctChange(thisWeek, weekPrevious),
    thisMonth,
    monthTrend: pctChange(thisMonth, monthPrevious),
    pending,
    projected: thisWeek + pending,
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
