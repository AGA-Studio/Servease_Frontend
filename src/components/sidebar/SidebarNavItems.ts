import {
  Home,
  LayoutDashboard,
  FileText,
  PlusSquare,
  MessageSquare,
  Briefcase,
  ClipboardCheck,
} from "lucide-react";
import { ROUTES } from "../../router/routes";
import React from "react";

export type NavGroup = "client" | "provider";

export interface NavItem {
  key: keyof (typeof import("../../i18n/locales/en/sidebar"))["sidebar"];
  icon: React.ReactNode;
  to: string;
  group: NavGroup;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: "home",
    icon: React.createElement(Home, { size: 19 }),
    to: ROUTES.APP.HOME,
    group: "client",
  },
  {
    key: "dashboard",
    icon: React.createElement(LayoutDashboard, { size: 19 }),
    to: ROUTES.APP.DASHBOARD,
    providerOnly: true,
  },
  {
    key: "myPost",
    icon: React.createElement(FileText, { size: 19 }),
    to: ROUTES.APP.MY_POST,
    group: "client",
  },
  {
    key: "newService",
    icon: React.createElement(PlusSquare, { size: 19 }),
    to: ROUTES.APP.NEW_SERVICE,
    group: "client",
  },
  {
    key: "messages",
    icon: React.createElement(MessageSquare, { size: 19 }),
    to: ROUTES.APP.MESSAGES,
    group: "client",
  },
  {
    key: "jobFeed",
    icon: React.createElement(Briefcase, { size: 19 }),
    to: ROUTES.APP.JOB_FEED,
    group: "provider",
  },
  {
    key: "myJobs",
    icon: React.createElement(ClipboardCheck, { size: 19 }),
    to: ROUTES.APP.MY_JOBS,
    group: "provider",
  },
];
