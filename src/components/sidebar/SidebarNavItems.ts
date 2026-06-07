import {
  Home,
  FileText,
  PlusSquare,
  MessageSquare,
  Briefcase,
  ClipboardCheck,
} from "lucide-react";
import { ROUTES } from "../../router/routes";
import React from "react";

export interface NavItem {
  key: keyof (typeof import("../../i18n/locales/en/sidebar"))["sidebar"];
  icon: React.ReactNode;
  to: string;
  providerOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: "home",
    icon: React.createElement(Home, { size: 19 }),
    to: ROUTES.APP.HOME,
  },
  {
    key: "myPost",
    icon: React.createElement(FileText, { size: 19 }),
    to: ROUTES.APP.MY_POST,
  },
  {
    key: "newService",
    icon: React.createElement(PlusSquare, { size: 19 }),
    to: ROUTES.APP.NEW_SERVICE,
  },
  {
    key: "messages",
    icon: React.createElement(MessageSquare, { size: 19 }),
    to: ROUTES.APP.MESSAGES,
  },
  {
    key: "jobFeed",
    icon: React.createElement(Briefcase, { size: 19 }),
    to: ROUTES.APP.JOB_FEED,
    providerOnly: true,
  },
  {
    key: "myJobs",
    icon: React.createElement(ClipboardCheck, { size: 19 }),
    to: ROUTES.APP.MY_JOBS,
    providerOnly: true,
  },
];
