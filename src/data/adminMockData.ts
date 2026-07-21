// Mock data for the admin panel. Replace with real API calls once the backend endpoints exist.

export interface AdminKpis {
  activeUsersToday: number;
  activeUsersTrend: number;
  newPosts: number;
  newPostsTrend: number;
  newJobs: number;
  newJobsTrend: number;
  applications: number;
  applicationsTrend: number;
  messagesSent: number;
  messagesTrend: number;
  apiErrorRate: number;
  apiErrorRateTrend: number;
}

export const ADMIN_KPIS: AdminKpis = {
  activeUsersToday: 342,
  activeUsersTrend: 8.4,
  newPosts: 57,
  newPostsTrend: 12.1,
  newJobs: 41,
  newJobsTrend: -3.2,
  applications: 128,
  applicationsTrend: 15.6,
  messagesSent: 892,
  messagesTrend: 6.7,
  apiErrorRate: 0.34,
  apiErrorRateTrend: -1.1,
};

export interface UserGrowthPoint {
  date: string;
  clients: number;
  providers: number;
}

export const USER_GROWTH: UserGrowthPoint[] = [
  { date: "1 Jul", clients: 210, providers: 96 },
  { date: "4 Jul", clients: 226, providers: 101 },
  { date: "7 Jul", clients: 241, providers: 108 },
  { date: "10 Jul", clients: 253, providers: 114 },
  { date: "13 Jul", clients: 268, providers: 119 },
  { date: "16 Jul", clients: 289, providers: 126 },
  { date: "20 Jul", clients: 312, providers: 135 },
];

export interface DailyActivityPoint {
  day: string;
  posts: number;
  applications: number;
  messages: number;
}

export const DAILY_ACTIVITY: DailyActivityPoint[] = [
  { day: "Lun", posts: 12, applications: 28, messages: 140 },
  { day: "Mar", posts: 18, applications: 34, messages: 165 },
  { day: "Mié", posts: 9, applications: 22, messages: 118 },
  { day: "Jue", posts: 21, applications: 41, messages: 190 },
  { day: "Vie", posts: 27, applications: 46, messages: 212 },
  { day: "Sáb", posts: 15, applications: 19, messages: 96 },
  { day: "Dom", posts: 8, applications: 14, messages: 71 },
];

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

export const CATEGORY_BREAKDOWN: CategorySlice[] = [
  { name: "Plomería", value: 32, color: "#2EBCCC" },
  { name: "Electricidad", value: 24, color: "#0432FF" },
  { name: "Limpieza", value: 19, color: "#4AA825" },
  { name: "Jardinería", value: 14, color: "#FFB200" },
  { name: "Otros", value: 11, color: "#8B5CF6" },
];

export type UserStatus = "active" | "suspended" | "pending";
export type MockUserRole = "client" | "provider" | "admin";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: MockUserRole;
  status: UserStatus;
  joinedAt: string;
  lastLogin: string;
  postsOrJobs: number;
}

export const MOCK_USERS: MockUser[] = [
  { id: "u1", name: "Sara Jiménez", email: "sara.jimenez@mail.com", role: "client", status: "active", joinedAt: "2026-02-14", lastLogin: "hace 2h", postsOrJobs: 6 },
  { id: "u2", name: "Miguel Rangel", email: "miguel.rangel@mail.com", role: "provider", status: "active", joinedAt: "2026-01-30", lastLogin: "hace 5h", postsOrJobs: 24 },
  { id: "u3", name: "Ana Torres", email: "ana.torres@mail.com", role: "client", status: "pending", joinedAt: "2026-07-18", lastLogin: "hace 1d", postsOrJobs: 0 },
  { id: "u4", name: "Carlos Beltrán", email: "carlos.beltran@mail.com", role: "provider", status: "suspended", joinedAt: "2025-11-02", lastLogin: "hace 9d", postsOrJobs: 11 },
  { id: "u5", name: "Lucía Fernández", email: "lucia.fernandez@mail.com", role: "client", status: "active", joinedAt: "2026-03-21", lastLogin: "hace 30m", postsOrJobs: 3 },
  { id: "u6", name: "David Ochoa", email: "david.ochoa@mail.com", role: "provider", status: "active", joinedAt: "2026-04-09", lastLogin: "hace 1h", postsOrJobs: 17 },
  { id: "u7", name: "Paola Ríos", email: "paola.rios@mail.com", role: "client", status: "active", joinedAt: "2026-05-17", lastLogin: "hace 3h", postsOrJobs: 2 },
  { id: "u8", name: "Jorge Salcido", email: "jorge.salcido@mail.com", role: "provider", status: "pending", joinedAt: "2026-07-15", lastLogin: "hace 4d", postsOrJobs: 0 },
];

export type PostStatus = "active" | "closed" | "flagged";

export interface MockPost {
  id: string;
  title: string;
  author: string;
  category: string;
  status: PostStatus;
  createdAt: string;
  offersCount: number;
}

export const MOCK_POSTS: MockPost[] = [
  { id: "p1", title: "Reparación de fuga en cocina", author: "Sara Jiménez", category: "Plomería", status: "active", createdAt: "2026-07-19", offersCount: 5 },
  { id: "p2", title: "Instalación eléctrica oficina", author: "Ana Torres", category: "Electricidad", status: "active", createdAt: "2026-07-18", offersCount: 3 },
  { id: "p3", title: "Mantenimiento de jardín residencial", author: "Lucía Fernández", category: "Jardinería", status: "closed", createdAt: "2026-07-14", offersCount: 8 },
  { id: "p4", title: "Limpieza profunda departamento", author: "Paola Ríos", category: "Limpieza", status: "flagged", createdAt: "2026-07-12", offersCount: 1 },
  { id: "p5", title: "Reparación de aire acondicionado", author: "Sara Jiménez", category: "Otros", status: "active", createdAt: "2026-07-11", offersCount: 2 },
  { id: "p6", title: "Cambio de chapa de seguridad", author: "Ana Torres", category: "Otros", status: "closed", createdAt: "2026-07-08", offersCount: 6 },
];

export type LogLevel = "info" | "warning" | "error";

export interface MockLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  endpoint: string;
  message: string;
  statusCode: number;
  latencyMs: number;
}

export const MOCK_LOGS: MockLog[] = [
  { id: "l1", timestamp: "20 Jul 09:42:11", level: "error", endpoint: "POST /api/posts", message: "Timeout al subir imágenes adjuntas", statusCode: 504, latencyMs: 8021 },
  { id: "l2", timestamp: "20 Jul 09:38:02", level: "warning", endpoint: "GET /api/jobs/feed", message: "Respuesta lenta, cache expirado", statusCode: 200, latencyMs: 1840 },
  { id: "l3", timestamp: "20 Jul 09:31:55", level: "info", endpoint: "POST /api/auth/login", message: "Inicio de sesión exitoso", statusCode: 200, latencyMs: 120 },
  { id: "l4", timestamp: "20 Jul 09:20:14", level: "error", endpoint: "POST /api/messages", message: "Fallo de conexión con socket de mensajería", statusCode: 500, latencyMs: 342 },
  { id: "l5", timestamp: "20 Jul 09:12:37", level: "info", endpoint: "GET /api/users/profile", message: "Perfil cargado correctamente", statusCode: 200, latencyMs: 89 },
  { id: "l6", timestamp: "20 Jul 08:55:03", level: "warning", endpoint: "POST /api/offers", message: "Rate limit cercano al límite (92%)", statusCode: 200, latencyMs: 210 },
  { id: "l7", timestamp: "20 Jul 08:40:29", level: "error", endpoint: "GET /api/posts/:id", message: "Post no encontrado, id inválido", statusCode: 404, latencyMs: 45 },
  { id: "l8", timestamp: "20 Jul 08:22:18", level: "info", endpoint: "POST /api/signup", message: "Nuevo usuario registrado", statusCode: 201, latencyMs: 156 },
];
