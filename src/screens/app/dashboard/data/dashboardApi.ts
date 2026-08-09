import type {
  DashboardData,
  DashboardJob,
  DashboardActivity,
  DashboardActivityType,
  KpiData,
  CategoryBreakdown,
  EarningsPoint,
} from "../../../../types/dashboard";
import type { JobClient } from "../../../../types/job";
import {
  fetchTrabajosDisponibles,
  type TrabajoDisponible,
} from "../../../../api/userApi";
import {
  fetchDashboardProveedor,
  fetchProviderEarningsSummary,
  type ProviderEarningsSummaryResponse,
  type ProviderKpisResponse,
} from "../../../../api/providerApi";
import { fetchNotificaciones } from "../../../../api/notificacionApi";
import { dotColorForTipo } from "../../../../utils/notifications";
import { timeAgo } from "../../../../utils/servicio";
import { getCookie, setCookie } from "../../../../lib/cookieUtils";
import { getCategoryStyle } from "../../../../utils/categoryStyle";

const ACTIVITY_TYPE_BY_TIPO: Record<string, DashboardActivityType> = {
  postulacion: "applied",
  oferta: "hired",
  servicio: "completed",
  mensaje: "message",
  calificacion: "review",
};

async function fetchRecentActivity(): Promise<DashboardActivity[]> {
  try {
    const data = await fetchNotificaciones();
    return data.slice(0, 5).map((n) => ({
      id: String(n.id_notificacion),
      type: ACTIVITY_TYPE_BY_TIPO[n.tipo] ?? "message",
      date: n.fecha,
      content: n.contenido ?? n.titulo,
      dotColor: dotColorForTipo(n.tipo),
    }));
  } catch (err) {
    console.error("fetchNotificaciones (recent activity) failed:", err);
    return [];
  }
}

const MOCK_CLIENT: JobClient = {
  id: "",
  name: "",
  avatar: "",
  rating: 0,
  reviewCount: 0,
  memberSince: "",
  jobsPosted: 0,
};

function mapTrabajoDisponibleToDashboardJob(
  item: TrabajoDisponible,
): DashboardJob {
  const price = Number(item.precio_inicial);
  const formattedPrice = `$${price.toLocaleString()}`;

  return {
    id: String(item.id_servicio),
    title: item.titulo,
    location: "",
    latitud: item.latitud_aprox,
    longitud: item.longitud_aprox,
    postedAgo: timeAgo(item.fecha),
    description: item.descripcion,
    budget: formattedPrice,
    priceRange: formattedPrice,
    price,
    currency: item.moneda ?? "MXN",
    proposalCount: item.num_postulantes,
    category: item.categoria,
    when: "",
    urgency: "",
    mainImage: item.foto ?? "",
    thumbnails: item.foto ? [item.foto] : [],
    client: MOCK_CLIENT,
  };
}

function deriveJobsByCategory(items: TrabajoDisponible[]): CategoryBreakdown[] {
  if (!items.length) return [];
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.categoria, (counts.get(item.categoria) ?? 0) + 1);
  }
  const total = items.length;
  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: getCategoryStyle(name).color,
    }))
    .sort((a, b) => b.value - a.value);
}

function buildEarningsTrend(
  value: number | undefined,
  label: string,
): { value: number; label: string; isPositive: boolean } | undefined {
  if (value === undefined) return undefined;
  return { value, label, isPositive: value >= 0 };
}

export function mapProviderKpisToKpiData(
  kpis: ProviderKpisResponse,
  earnings?: ProviderEarningsSummaryResponse,
): KpiData[] {
  const vsLastMonth = "vs last month";
  return [
    {
      key: "activeJobs",
      label: "Active Jobs",
      value: kpis.activeJobs,
      iconName: "briefcase",
      iconColor: "#2EBCCC",
      iconBg: "rgba(46,188,204,0.15)",
      ...(kpis.activeJobsTrend !== undefined && {
        trend: { value: kpis.activeJobsTrend, label: vsLastMonth, isPositive: kpis.activeJobsTrend >= 0 },
      }),
    },
    {
      key: "completedJobs",
      label: "Completed",
      value: kpis.completedJobs,
      iconName: "checkCircle",
      iconColor: "#4AA825",
      iconBg: "rgba(74,168,37,0.15)",
      ...(kpis.completedJobsTrend !== undefined && {
        trend: { value: kpis.completedJobsTrend, label: vsLastMonth, isPositive: kpis.completedJobsTrend >= 0 },
      }),
    },
    {
      key: "earnings",
      label: "Earnings",
      value: earnings?.total ?? kpis.earnings,
      iconName: "dollarSign",
      iconColor: "#FFB200",
      iconBg: "rgba(255,178,0,0.15)",
      ...(kpis.earningsTrend !== undefined && {
        trend: { value: kpis.earningsTrend, label: vsLastMonth, isPositive: kpis.earningsTrend >= 0 },
      }),
      ...(earnings && {
        periodOptions: [
          {
            key: "total",
            label: "Total",
            value: earnings.total || kpis.earnings,
          },
          {
            key: "month",
            label: "Monthly",
            value: earnings.thisMonth,
            ...(earnings.monthTrend !== undefined && {
              trend: buildEarningsTrend(earnings.monthTrend, vsLastMonth),
            }),
          },
          {
            key: "week",
            label: "Weekly",
            value: earnings.thisWeek,
            ...(earnings.weekTrend !== undefined && {
              trend: buildEarningsTrend(earnings.weekTrend, vsLastMonth),
            }),
          },
        ],
      }),
    },
    {
      key: "averageRating",
      label: "Rating",
      value: kpis.rating ? kpis.rating.toFixed(1) : "0.0",
      iconName: "star",
      iconColor: "#FFB200",
      iconBg: "rgba(255,178,0,0.15)",
    },
  ];
}

export function getCachedDashboardData(userId: string): DashboardData | null {
  const kpis = getCookie<ProviderKpisResponse>(`pv-dashboard-kpis:${userId}`);
  const earnings = getCookie<ProviderEarningsSummaryResponse>(
    `pv-earnings:${userId}`,
  );
  if (!kpis) return null;

  const earningsSummary = earnings ?? undefined;
  const earningsPoints: EarningsPoint[] = earningsSummary
    ? [
        { month: "thisWeek", earnings: earningsSummary.thisWeek },
        { month: "thisMonth", earnings: earningsSummary.thisMonth },
        { month: "pending", earnings: earningsSummary.pending },
        { month: "projected", earnings: earningsSummary.projected },
      ]
    : [];

  return {
    kpis: mapProviderKpisToKpiData(kpis, earningsSummary),
    earnings: earningsPoints,
    jobsByCategory: [],
    availableJobs: [],
    recentActivity: [],
  };
}

export const MOCK_JOBS_BY_CATEGORY: CategoryBreakdown[] = [
  { name: "Plumbing", value: 40, color: getCategoryStyle("Plumbing").color },
  { name: "Electrical", value: 30, color: getCategoryStyle("Electrical").color },
  { name: "Gardening", value: 20, color: getCategoryStyle("Gardening").color },
  { name: "HVAC", value: 10, color: getCategoryStyle("HVAC").color },
];

export async function fetchDashboardData(
  userId: string,
  convertUsdToMxn: (amountUsd: number) => number,
): Promise<DashboardData> {
  const availablePromise = (async (): Promise<TrabajoDisponible[]> => {
    try {
      const response = await fetchTrabajosDisponibles({
        page: 1,
        pageSize: 50,
      });
      return response.results;
    } catch (err) {
      console.error("fetchTrabajosDisponibles failed:", err);
      return [];
    }
  })();

  const providerDataPromise = (async (): Promise<{
    kpis: KpiData[];
    earningsSummary: ProviderEarningsSummaryResponse | undefined;
  }> => {
    try {
      const dashboardKpis = await fetchDashboardProveedor(userId);
      let earningsSummary: ProviderEarningsSummaryResponse | undefined;
      try {
        earningsSummary = await fetchProviderEarningsSummary(convertUsdToMxn);
      } catch (err) {
        console.error("fetchProviderEarningsSummary failed:", err);
      }
      setCookie(`pv-dashboard-kpis:${userId}`, dashboardKpis, 300);
      if (earningsSummary) {
        setCookie(`pv-earnings:${userId}`, earningsSummary, 300);
      }
      return {
        kpis: mapProviderKpisToKpiData(dashboardKpis, earningsSummary),
        earningsSummary,
      };
    } catch (err) {
      console.error("fetch dashboard KPIs failed:", err);
      return { kpis: [], earningsSummary: undefined };
    }
  })();

  const [availableItems, providerData, recentActivity] = await Promise.all([
    availablePromise,
    providerDataPromise,
    fetchRecentActivity(),
  ]);

  const jobsByCategory = deriveJobsByCategory(availableItems);
  const visibleItems = availableItems.slice(0, 5);
  const availableJobs = visibleItems.map(mapTrabajoDisponibleToDashboardJob);

  const earningsPoints: EarningsPoint[] = providerData.earningsSummary
    ? [
        { month: "thisWeek", earnings: providerData.earningsSummary.thisWeek },
        { month: "thisMonth", earnings: providerData.earningsSummary.thisMonth },
        { month: "pending", earnings: providerData.earningsSummary.pending },
        { month: "projected", earnings: providerData.earningsSummary.projected },
      ]
    : [];

  return {
    kpis: providerData.kpis,
    earnings: earningsPoints,
    jobsByCategory,
    availableJobs,
    recentActivity,
  };
}
