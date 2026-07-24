import type {
  DashboardData,
  DashboardJob,
  DashboardActivity,
  KpiData,
  EarningsPoint,
  CategoryBreakdown,
} from "../../../../types/dashboard";
import type { JobClient } from "../../../../types/job";

const MOCK_CLIENT: JobClient = {
  name: "Maria Cazares",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
  rating: 4.9,
  reviewCount: 12,
  memberSince: "Sep. 2025",
  jobsPosted: 8,
};

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

export const MOCK_AVAILABLE_JOBS: DashboardJob[] = [
  {
    id: "1",
    title: "Emergency Plumber Needed",
    location: "El Refugio, Tijuana",
    postedAgo: "2h ago",
    description:
      "Looking for a licensed plumber to fix a burst pipe in the kitchen. Needs to be done immediately.",
    budget: "$350 - $500",
    priceRange: "$350 - $500",
    price: 425,
    proposalCount: 5,
    category: "Plumbing",
    when: "Today",
    urgency: "ASAP",
    mainImage:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=200&q=80",
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=200&q=80",
    ],
    client: MOCK_CLIENT,
  },
  {
    id: "2",
    title: "Electrical Wiring Installation",
    location: "Centro, Tijuana",
    postedAgo: "5h ago",
    description:
      "Need a certified electrician to install wiring for a new office space. Approximately 2000 sq ft.",
    budget: "$800 - $1,200",
    priceRange: "$800 - $1,200",
    price: 1000,
    proposalCount: 3,
    category: "Electrical",
    when: "Tomorrow",
    urgency: "Flexible",
    mainImage:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&q=80",
    ],
    client: MOCK_CLIENT,
  },
  {
    id: "3",
    title: "Garden Landscaping",
    location: "Playas, Tijuana",
    postedAgo: "1d ago",
    description:
      "Looking for a landscaper to redesign and maintain a residential garden.",
    budget: "$500 - $700",
    priceRange: "$500 - $700",
    price: 600,
    proposalCount: 8,
    category: "Gardening",
    when: "This week",
    urgency: "Flexible",
    mainImage:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=80",
    ],
    client: MOCK_CLIENT,
  },
  {
    id: "4",
    title: "AC Repair & Maintenance",
    location: "Otay, Tijuana",
    postedAgo: "2d ago",
    description: "Central AC unit not cooling properly. Need diagnosis and repair.",
    budget: "$200 - $400",
    priceRange: "$200 - $400",
    price: 300,
    proposalCount: 2,
    category: "HVAC",
    when: "Today",
    urgency: "ASAP",
    mainImage:
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=200&q=80",
    ],
    client: MOCK_CLIENT,
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
  availableJobs: MOCK_AVAILABLE_JOBS,
  recentActivity: MOCK_ACTIVITIES,
};

/**
 * Simulates an async fetch to Supabase. Swap this import for the real API call
 * when backend tables are ready.
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_DASHBOARD_DATA), 800);
  });
}
