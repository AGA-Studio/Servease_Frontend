// Central route path constants used across the application.

export const ROUTES = {
  AUTH: "/auth",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  APP: {
    HOME: "/app/home",
    DASHBOARD: "/app/dashboard",
    MY_POST: "/app/my-post",
    NEW_SERVICE: "/app/new-service",
    MESSAGES: "/app/messages",
    JOB_FEED: "/app/job-feed",
    MY_JOBS: "/app/my-jobs",
    PROFILE: "/app/profile",
    SETTINGS: "/app/settings",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
  },
} as const;
  