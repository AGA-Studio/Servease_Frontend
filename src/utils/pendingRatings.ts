export interface PendingClientRating {
  jobId: string;
  jobTitle: string;
  provider: {
    name: string;
    profession?: string;
    avatarUrl?: string;
    rating: number;
    reviewsCount: number;
  };
}

const KEY = "servease-pending-client-rating";

export const getPendingClientRating = (): PendingClientRating | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingClientRating) : null;
  } catch {
    return null;
  }
};

export const setPendingClientRating = (data: PendingClientRating): void => {
  localStorage.setItem(KEY, JSON.stringify(data));
};

export const clearPendingClientRating = (): void => {
  localStorage.removeItem(KEY);
};
