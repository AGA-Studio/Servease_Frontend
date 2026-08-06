import type {
  DashboardData,
  DashboardJob,
  KpiData,
  CategoryBreakdown,
  EarningsPoint,
} from "../../../../types/dashboard";
import type { JobClient } from "../../../../types/job";
import {
  fetchServiciosCatalog,
  type ServicioListItem,
} from "../../../../api/servicioApi";
import {
  fetchDashboardProveedor,
  fetchProviderEarningsSummary,
  type ProviderEarningsSummaryResponse,
  type ProviderKpisResponse,
} from "../../../../api/providerApi";
import { timeAgo } from "../../../../utils/servicio";
import { getCookie, setCookie } from "../../../../lib/cookieUtils";

const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: "#2EBCCC",
  Plomería: "#2EBCCC",
  Electrical: "#FFB200",
  Electricidad: "#FFB200",
  Gardening: "#0432FF",
  Jardinería: "#0432FF",
  HVAC: "#4AA825",
  Locksmith: "#2EBCCC",
  Cerrajería: "#2EBCCC",
};

const DEFAULT_COLORS = ["#2EBCCC", "#FFB200", "#0432FF", "#4AA825", "#FF6B6B", "#845EF7"];

const MOCK_CLIENT: JobClient = {
  name: "",
  avatar: "",
  rating: 0,
  reviewCount: 0,
  memberSince: "",
  jobsPosted: 0,
};

function mapCatalogItemToDashboardJob(
  item: ServicioListItem,
): DashboardJob {
  const price = Number(item.precio_inicial);
  const formattedPrice = `$${price.toLocaleString()}`;

  return {
    id: String(item.id_servicio),
    title: item.titulo,
    location: "",
    latitud: item.latitud,
    longitud: item.longitud,
    postedAgo: timeAgo(item.fecha),
    description: "",
    budget: formattedPrice,
    priceRange: formattedPrice,
    price,
    currency: "MXN",
    proposalCount: 0,
    category: item.categoria_nombre,
    when: "",
    urgency: "",
    mainImage: item.imagenes[0] ?? "",
    thumbnails: item.imagenes,
    client: MOCK_CLIENT,
  };
}

function deriveJobsByCategory(items: ServicioListItem[]): CategoryBreakdown[] {
  if (!items.length) return [];
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.categoria_nombre, (counts.get(item.categoria_nombre) ?? 0) + 1);
  }
  const total = items.length;
  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[name] ?? DEFAULT_COLORS[Math.min(counts.size, DEFAULT_COLORS.length)],
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
      value: kpis.rating,
      iconName: "star",
      iconColor: "#FFB200",
      iconBg: "rgba(255,178,0,0.15)",
    },
  ];
}

export function getCachedDashboardData(): DashboardData | null {
  const kpis = getCookie<ProviderKpisResponse>("pv-dashboard-kpis");
  const earnings = getCookie<ProviderEarningsSummaryResponse>("pv-earnings");
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

export async function fetchDashboardData(
  userId: string,
  areaNames?: string[],
): Promise<DashboardData> {
  const catalogPromise = (async (): Promise<ServicioListItem[]> => {
    try {
      const all = await fetchServiciosCatalog({ estado: "abierto", page_size: 10000 });
      const items = all.results;
      return areaNames && areaNames.length > 0
        ? items.filter((item) => areaNames.includes(item.categoria_nombre))
        : items;
    } catch (err) {
      console.error("fetchServiciosCatalog failed:", err);
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
        earningsSummary = await fetchProviderEarningsSummary();
      } catch (err) {
        console.error("fetchProviderEarningsSummary failed:", err);
      }
      setCookie("pv-dashboard-kpis", dashboardKpis, 300);
      if (earningsSummary) setCookie("pv-earnings", earningsSummary, 300);
      return {
        kpis: mapProviderKpisToKpiData(dashboardKpis, earningsSummary),
        earningsSummary,
      };
    } catch (err) {
      console.error("fetch dashboard KPIs failed:", err);
      return { kpis: [], earningsSummary: undefined };
    }
  })();

  const [catalogItems, providerData] = await Promise.all([
    catalogPromise,
    providerDataPromise,
  ]);

  const jobsByCategory = deriveJobsByCategory(catalogItems);
  const visibleItems = catalogItems.slice(0, 5);
  const availableJobs = visibleItems.map(mapCatalogItemToDashboardJob);

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
    recentActivity: [],
  };
}
