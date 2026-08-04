import type {
  DashboardData,
  DashboardJob,
  KpiData,
  CategoryBreakdown,
} from "../../../../types/dashboard";
import type { JobClient } from "../../../../types/job";
import {
  fetchServiciosCatalog,
  type ServicioListItem,
} from "../../../../api/servicioApi";
import {
  fetchDashboardProveedor,
  type ProviderKpisResponse,
} from "../../../../api/providerApi";
import { timeAgo } from "../../../../utils/servicio";
import { getApproxLocation } from "../../../../utils/location";

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

async function mapCatalogItemToDashboardJob(
  item: ServicioListItem,
): Promise<DashboardJob> {
  const location = await getApproxLocation(item.latitud, item.longitud);
  const price = Number(item.precio_inicial);
  const formattedPrice = `$${price.toLocaleString()}`;

  return {
    id: String(item.id_servicio),
    title: item.titulo,
    location,
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

function mapProviderKpisToKpiData(
  kpis: ProviderKpisResponse,
): KpiData[] {
  return [
    {
      key: "activeJobs",
      label: "Active Jobs",
      value: kpis.activeJobs,
      iconName: "briefcase",
      iconColor: "#2EBCCC",
      iconBg: "rgba(46,188,204,0.15)",
      ...(kpis.activeJobsTrend !== undefined && {
        trend: { value: kpis.activeJobsTrend, label: "vs last month", isPositive: kpis.activeJobsTrend >= 0 },
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
        trend: { value: kpis.completedJobsTrend, label: "vs last month", isPositive: kpis.completedJobsTrend >= 0 },
      }),
    },
    {
      key: "earnings",
      label: "Earnings",
      value: kpis.earnings,
      iconName: "dollarSign",
      iconColor: "#FFB200",
      iconBg: "rgba(255,178,0,0.15)",
      ...(kpis.earningsTrend !== undefined && {
        trend: { value: kpis.earningsTrend, label: "vs last month", isPositive: kpis.earningsTrend >= 0 },
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

export async function fetchDashboardData(
  userId: string,
  areaNames?: string[],
): Promise<DashboardData> {
  let catalogItems: ServicioListItem[] = [];
  try {
    const all = await fetchServiciosCatalog({ estado: "abierto" });
    catalogItems =
      areaNames && areaNames.length > 0
        ? all.filter((item) => areaNames.includes(item.categoria_nombre))
        : all;
  } catch (err) {
    console.error("fetchServiciosCatalog failed:", err);
  }
  const availableJobs = await Promise.all(
    catalogItems.map(mapCatalogItemToDashboardJob),
  );

  const jobsByCategory = deriveJobsByCategory(catalogItems);

  let kpis: KpiData[] = [];
  try {
    kpis = mapProviderKpisToKpiData(await fetchDashboardProveedor(userId));
  } catch (err) {
    console.error("fetchDashboardProveedor failed:", err);
  }

  return {
    kpis,
    earnings: [],
    jobsByCategory,
    availableJobs,
    recentActivity: [],
  };
}
