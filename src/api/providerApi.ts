import { apiGet } from "./apiClient";

export interface ProviderKpisResponse {
  activeJobs: number;
  completedJobs: number;
  earnings: number;
  rating: number;
  activeJobsTrend?: number;
  completedJobsTrend?: number;
  earningsTrend?: number;
}

export async function fetchProviderKpis(): Promise<ProviderKpisResponse> {
  return apiGet<ProviderKpisResponse>("/api/proveedores/dashboard/kpis/");
}

export interface ProviderEarningsPoint {
  month: string;
  earnings: number;
}

export async function fetchProviderEarnings(): Promise<ProviderEarningsPoint[]> {
  return apiGet<ProviderEarningsPoint[]>("/api/proveedores/dashboard/earnings/");
}

export interface ProviderActivityItem {
  id: string;
  type: "applied" | "hired" | "completed" | "payment" | "review" | "message";
  timeAgo: string;
  content: string;
  highlight?: string;
  extra?: string;
  dotColor: string;
}

export async function fetchProviderActivity(): Promise<ProviderActivityItem[]> {
  return apiGet<ProviderActivityItem[]>("/api/proveedores/dashboard/activity/");
}

export interface ProviderAppliedJob {
  id: string;
  title: string;
  status: "reviewing" | "completed" | "declined" | "closed";
  sentAgo: string;
  price: number;
  currency: string;
}

export async function fetchProviderAppliedJobs(): Promise<ProviderAppliedJob[]> {
  return apiGet<ProviderAppliedJob[]>("/api/proveedores/mis-postulaciones/");
}

export interface ProviderEarningsSummaryResponse {
  thisWeek: number;
  pending: number;
  projected: number;
}

export async function fetchProviderEarningsSummary(): Promise<ProviderEarningsSummaryResponse> {
  return apiGet<ProviderEarningsSummaryResponse>("/api/proveedores/earnings-summary/");
}
