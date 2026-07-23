export type DashboardActivityType =
  | "applied"
  | "hired"
  | "completed"
  | "payment"
  | "review"
  | "message";

export interface DashboardActivity {
  id: string;
  type: DashboardActivityType;
  timeAgo: string;
  content: string;
  highlight?: string;
  extra?: string;
  dotColor: string;
}

import type { JobClient } from "./job";

export interface DashboardJob {
  id: string;
  title: string;
  location: string;
  postedAgo: string;
  description: string;
  budget: string;
  priceRange: string;
  price: number;
  proposalCount: number;
  category: string;
  when: string;
  urgency: string;
  mainImage: string;
  thumbnails: string[];
  client: JobClient;
}

export interface KpiData {
  key: string;
  label: string;
  value: string | number;
  iconName: "briefcase" | "checkCircle" | "dollarSign" | "star";
  iconColor: string;
  iconBg: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export interface EarningsPoint {
  month: string;
  earnings: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface DashboardData {
  kpis: KpiData[];
  earnings: EarningsPoint[];
  jobsByCategory: CategoryBreakdown[];
  availableJobs: DashboardJob[];
  recentActivity: DashboardActivity[];
}
