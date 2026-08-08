

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
    NOTIFICATIONS: "/app/notifications",
    JOB_FEED: "/app/job-feed",
    MY_JOBS: "/app/my-jobs",
    PROFILE: "/app/profile",
    SETTINGS: "/app/settings",
    POST_OFFERS: "/app/my-post/:postId",
    CLIENT_PROFILE_VIEW: "/app/clients/:id",
    PROVIDER_PROFILE_VIEW: "/app/providers/:id",
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

export const buildClientProfileViewPath = (clientId: string): string =>
  `/app/clients/${clientId}`;

export const buildProviderProfileViewPath = (providerId: string): string =>
  `/app/providers/${providerId}`;
