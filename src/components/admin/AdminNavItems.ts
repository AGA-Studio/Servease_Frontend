import { LayoutDashboard, Users, FileText, ScrollText } from "lucide-react";
import React from "react";
import { ROUTES } from "../../router/routes";

export interface AdminNavItem {
  key: "dashboard" | "users" | "posts" | "logs";
  icon: React.ReactNode;
  to: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    key: "dashboard",
    icon: React.createElement(LayoutDashboard, { size: 19 }),
    to: ROUTES.ADMIN.DASHBOARD,
  },
  {
    key: "users",
    icon: React.createElement(Users, { size: 19 }),
    to: ROUTES.ADMIN.USERS,
  },
  {
    key: "posts",
    icon: React.createElement(FileText, { size: 19 }),
    to: ROUTES.ADMIN.POSTS,
  },
  {
    key: "logs",
    icon: React.createElement(ScrollText, { size: 19 }),
    to: ROUTES.ADMIN.LOGS,
  },
];
