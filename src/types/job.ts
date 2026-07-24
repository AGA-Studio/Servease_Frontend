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
  when: string;
  urgency: string;
  postedAgo: string;
  price: number;
  priceRange: string;
  description: string;
  mainImage: string;
  thumbnails: string[];
  client: JobClient;
  distance?: string;
  proposalCount?: number;
}
