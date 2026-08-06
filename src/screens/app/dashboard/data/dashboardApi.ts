import type {
  DashboardData,
  DashboardJob,
  DashboardActivity,
  KpiData,
  EarningsPoint,
  CategoryBreakdown,
} from "../../../../types/dashboard";
import type { JobClient } from "../../../../types/job";
import {
  fetchServiciosCatalog,
  type ServicioListItem,
} from "../../../../api/servicioApi";
import {
  fetchDashboardProveedor,
  fetchProviderEarnings,
  fetchProviderActivity,
  type ProviderActivityItem,
  type ProviderKpisResponse,
} from "../../../../api/providerApi";
import { timeAgo } from "../../../../utils/servicio";
import { getApproxLocation } from "../../../../utils/location";
import { getCategoryStyle } from "../../../../utils/categoryStyle";

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
      color: getCategoryStyle(name).color,
    }))
    .sort((a, b) => b.value - a.value);
}

function mapProviderActivityToDashboard(activities: ProviderActivityItem[]): DashboardActivity[] {
  return activities.map((a) => ({
    id: a.id,
    type: a.type,
    timeAgo: a.timeAgo,
    content: a.content,
    highlight: a.highlight,
    extra: a.extra,
    dotColor: a.dotColor,
  }));
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

export const MOCK_ACTIVITIES: DashboardActivity[] = [
  {
    id: "1",
    type: "applied",
    timeAgo: "30 mins ago",
    content: " you a proposal for 'Emergency Plumber Needed'.",
    highlight: "You submitted",
    extra: "Budget: $450",
    dotColor: "#2EBCCC",
  },
  {
    id: "2",
    type: "hired",
    timeAgo: "2 hours ago",
    content: " accepted your proposal for 'Office Cleaning'.",
    highlight: "Sara J.",
    dotColor: "#4AA825",
  },
  {
    id: "3",
    type: "completed",
    timeAgo: "5 hours ago",
    content: " successfully completed.",
    highlight: "'Electrical Repair'",
    dotColor: "#4AA825",
  },
  {
    id: "4",
    type: "payment",
    timeAgo: "Yesterday",
    content: "Payment received: ",
    highlight: "$350",
    extra: "From: 'Lock Installation'",
    dotColor: "#FFB200",
  },
  {
    id: "5",
    type: "message",
    timeAgo: "2 days ago",
    content: " sent you a message about 'Garden Landscaping'.",
    highlight: "Mike R.",
    dotColor: "#2EBCCC",
  },
];

export const MOCK_EARNINGS: EarningsPoint[] = [
  { month: "Feb", earnings: 2100 },
  { month: "Mar", earnings: 2800 },
  { month: "Apr", earnings: 2450 },
  { month: "May", earnings: 3200 },
  { month: "Jun", earnings: 2900 },
  { month: "Jul", earnings: 3450 },
];

export const MOCK_JOBS_BY_CATEGORY: CategoryBreakdown[] = [
  { name: "Plumbing", value: 40, color: getCategoryStyle("Plumbing").color },
  { name: "Electrical", value: 30, color: getCategoryStyle("Electrical").color },
  { name: "Gardening", value: 20, color: getCategoryStyle("Gardening").color },
  { name: "HVAC", value: 10, color: getCategoryStyle("HVAC").color },
];

export async function fetchDashboardData(
  userId: string,
  workAreaIds?: number[],
): Promise<DashboardData> {
  let catalogItems: ServicioListItem[] = [];
  try {
    if (workAreaIds && workAreaIds.length > 0) {
      const results = await Promise.all(
        workAreaIds.map((id) =>
          fetchServiciosCatalog({ categoriaId: id, estado: "abierto" }),
        ),
      );
      const seen = new Set<number>();
      for (const items of results) {
        for (const item of items) {
          if (!seen.has(item.id_servicio)) {
            seen.add(item.id_servicio);
            catalogItems.push(item);
          }
        }
      }
    } else {
      catalogItems = await fetchServiciosCatalog({ estado: "abierto" });
    }
  } catch (err) {
    console.error("fetchServiciosCatalog failed:", err);
  }
  const availableJobs = await Promise.all(
    catalogItems.map(mapCatalogItemToDashboardJob),
  );

  const jobsByCategory = deriveJobsByCategory(catalogItems);

  const results = await Promise.allSettled([
    fetchDashboardProveedor(userId),
    fetchProviderEarnings(),
    fetchProviderActivity(),
  ]);

  const [kpisResult, earningsResult, activityResult] = results;

  const kpis =
    kpisResult.status === "fulfilled"
      ? mapProviderKpisToKpiData(kpisResult.value)
      : [];

  const earnings =
    earningsResult.status === "fulfilled"
      ? earningsResult.value.map((p) => ({ month: p.month, earnings: p.earnings }))
      : MOCK_EARNINGS;

  const recentActivity =
    activityResult.status === "fulfilled"
      ? mapProviderActivityToDashboard(activityResult.value)
      : MOCK_ACTIVITIES;

  return {
    kpis,
    earnings,
    jobsByCategory: jobsByCategory.length ? jobsByCategory : MOCK_JOBS_BY_CATEGORY,
    availableJobs,
    recentActivity,
  };
}
