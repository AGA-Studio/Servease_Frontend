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
    POST_OFFERS: "/app/my-post/:postId",
    POST_DETAILS: "/app/my-post/:postId/details",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
  },
} as const;

// Builds a concrete path to the post-offers screen for a given post id.
export const buildPostOffersPath = (postId: string): string =>
  `/app/my-post/${postId}`;

// Builds a concrete path to the post-details screen for a given post id.
export const buildPostDetailsPath = (postId: string): string =>
  `/app/my-post/${postId}/details`;
