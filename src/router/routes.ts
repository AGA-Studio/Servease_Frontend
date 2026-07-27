

export const ROUTES = {
  AUTH: "/auth",
  CONFIRM_EMAIL: "/confirm-email",
  RESET_PASSWORD: "/reset-password",
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
    POST_OFFERS: "/app/my-post/:postId",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    POSTS: "/admin/posts",
    LOGS: "/admin/logs",
  },
} as const;

export const buildPostOffersPath = (postId: string): string =>
  `/app/my-post/${postId}`;
