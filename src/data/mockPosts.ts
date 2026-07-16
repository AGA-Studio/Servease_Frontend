export type PostStatus = "receiving" | "in_progress" | "completed";

export interface MyPost {
  id: string;
  title: string;
  category: string;
  status: PostStatus;
  postedAgo: string;
  budget: number;
  currency: string;
  applicantCount: number;
  imageUrl?: string;
}

export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";

export const MOCK_POSTS: MyPost[] = [
  {
    id: "1",
    title: "Emergency Locksmith Needed for Front Door",
    category: "locksmith",
    status: "receiving",
    postedAgo: "2h",
    budget: 780,
    currency: "MXN",
    applicantCount: 8,
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    id: "2",
    title: "Plumbing Repair — Kitchen Burst Pipe",
    category: "plumbing",
    status: "in_progress",
    postedAgo: "1d",
    budget: 1200,
    currency: "MXN",
    applicantCount: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
  },
  {
    id: "3",
    title: "House Deep Cleaning Service",
    category: "cleaning",
    status: "completed",
    postedAgo: "3d",
    budget: 600,
    currency: "MXN",
    applicantCount: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80",
  },
  {
    id: "4",
    title: "Electrical Panel Upgrade",
    category: "electrical",
    status: "receiving",
    postedAgo: "5h",
    budget: 2500,
    currency: "MXN",
    applicantCount: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
  },
  {
    id: "5",
    title: "Interior Painting — 3 Rooms",
    category: "painting",
    status: "completed",
    postedAgo: "1w",
    budget: 3200,
    currency: "MXN",
    applicantCount: 7,
    imageUrl:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
  },
  {
    id: "6",
    title: "Garden Maintenance & Trimming",
    category: "gardening",
    status: "in_progress",
    postedAgo: "2d",
    budget: 450,
    currency: "MXN",
    applicantCount: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
  },
  {
    id: "7",
    title: "Carpentry — Custom Bookshelf Build",
    category: "carpentry",
    status: "receiving",
    postedAgo: "8h",
    budget: 1800,
    currency: "MXN",
    applicantCount: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?w=800&q=80",
  },
  {
    id: "8",
    title: "Apartment Move — 2 Bedroom",
    category: "moving",
    status: "completed",
    postedAgo: "4d",
    budget: 2100,
    currency: "MXN",
    applicantCount: 9,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  },
  {
    id: "9",
    title: "Bathroom Sink Leak Repair",
    category: "plumbing",
    status: "in_progress",
    postedAgo: "12h",
    budget: 350,
    currency: "MXN",
    applicantCount: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  },
  {
    id: "10",
    title: "Ceiling Fan Installation",
    category: "electrical",
    status: "receiving",
    postedAgo: "3h",
    budget: 500,
    currency: "MXN",
    applicantCount: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1631545806609-cfd9c0e5d1c5?w=800&q=80",
  },
  {
    id: "11",
    title: "Office Deep Clean — Weekly Contract",
    category: "cleaning",
    status: "receiving",
    postedAgo: "1h",
    budget: 900,
    currency: "MXN",
    applicantCount: 11,
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
  },
  {
    id: "12",
    title: "Fence Painting — Backyard",
    category: "painting",
    status: "completed",
    postedAgo: "2w",
    budget: 700,
    currency: "MXN",
    applicantCount: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80",
  },
  {
    id: "13",
    title: "Front Yard Landscaping Refresh",
    category: "gardening",
    status: "receiving",
    postedAgo: "6h",
    budget: 1500,
    currency: "MXN",
    applicantCount: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1599685315640-4a9ba2e3e2b8?w=800&q=80",
  },
];
