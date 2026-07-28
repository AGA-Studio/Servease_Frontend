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
import { timeAgo } from "../../../../utils/servicio";
import { getApproxLocation } from "../../../../utils/location";

const MOCK_CLIENT: JobClient = {
  name: "Maria Cazares",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
  rating: 4.9,
  reviewCount: 12,
  memberSince: "Sep. 2025",
  jobsPosted: 8,
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

export const MOCK_KPIS: KpiData[] = [
  {
    key: "activeJobs",
    label: "Active Jobs",
    value: 5,
    iconName: "briefcase",
    iconColor: "#2EBCCC",
    iconBg: "rgba(46,188,204,0.15)",
    trend: {
      value: 12,
      label: "vs last month",
      isPositive: true,
    },
  },
  {
    key: "completedJobs",
    label: "Completed",
    value: 24,
    iconName: "checkCircle",
    iconColor: "#4AA825",
    iconBg: "rgba(74,168,37,0.15)",
    trend: {
      value: 8,
      label: "vs last month",
      isPositive: true,
    },
  },
  {
    key: "earnings",
    label: "Earnings",
    value: "$3,450",
    iconName: "dollarSign",
    iconColor: "#FFB200",
    iconBg: "rgba(255,178,0,0.15)",
    trend: {
      value: 15,
      label: "vs last month",
      isPositive: true,
    },
  },
  {
    key: "averageRating",
    label: "Rating",
    value: "4.8",
    iconName: "star",
    iconColor: "#FFB200",
    iconBg: "rgba(255,178,0,0.15)",
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
  { name: "Plumbing", value: 40, color: "#2EBCCC" },
  { name: "Electrical", value: 30, color: "#FFB200" },
  { name: "Gardening", value: 20, color: "#0432FF" },
  { name: "HVAC", value: 10, color: "#4AA825" },
];

export const MOCK_DASHBOARD_DATA: DashboardData = {
  kpis: MOCK_KPIS,
  earnings: MOCK_EARNINGS,
  jobsByCategory: MOCK_JOBS_BY_CATEGORY,
  availableJobs: [],
  recentActivity: MOCK_ACTIVITIES,
};

export async function fetchDashboardData(): Promise<DashboardData> {
  const catalogItems = await fetchServiciosCatalog({ estado: "abierto" });
  const availableJobs = await Promise.all(
    catalogItems.map(mapCatalogItemToDashboardJob),
  );

  return {
    ...MOCK_DASHBOARD_DATA,
    availableJobs,
  };
}
