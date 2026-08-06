export interface JobClient {
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  memberSince: string;
  jobsPosted: number;
}

export interface JobDetails {
  id: string;
  title: string;
  category: string;
  location: string;
  latitud?: number | null;
  longitud?: number | null;
  when: string;
  urgency: string;
  postedAgo: string;
  fecha_final?: string | null;
  price: number;
  currency?: string;
  priceRange: string;
  description: string;
  mainImage: string;
  thumbnails: string[];
  client: JobClient;
  distance?: string;
  proposalCount?: number;
}
