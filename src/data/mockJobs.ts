export type ProposalStatus = "accepted" | "pending";

export interface MyJob {
  id: string;
  title: string;
  category: string;
  proposalStatus: ProposalStatus;
  postedAgo: string;
  budget: number;
  currency: string;
  imageUrl?: string;
}

export const MOCK_JOBS: MyJob[] = [
  {
    id: "1",
    title: "Emergency Locksmith Needed for Front Door",
    category: "locksmith",
    proposalStatus: "accepted",
    postedAgo: "2h",
    budget: 780,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "2",
    title: "Bathroom Pipe Leak Repair",
    category: "plumbing",
    proposalStatus: "pending",
    postedAgo: "5h",
    budget: 350,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "3",
    title: "Office Electrical Wiring Installation",
    category: "electrical",
    proposalStatus: "accepted",
    postedAgo: "1d",
    budget: 1200,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "4",
    title: "Deep Cleaning for 2-Bedroom Apartment",
    category: "cleaning",
    proposalStatus: "pending",
    postedAgo: "1d",
    budget: 180,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "5",
    title: "Interior Painting — 3 Rooms",
    category: "painting",
    proposalStatus: "accepted",
    postedAgo: "2d",
    budget: 3200,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "6",
    title: "Garden Maintenance & Trimming",
    category: "gardening",
    proposalStatus: "pending",
    postedAgo: "2d",
    budget: 450,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "7",
    title: "Custom Bookshelf Build",
    category: "carpentry",
    proposalStatus: "accepted",
    postedAgo: "8h",
    budget: 1800,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "8",
    title: "Apartment Move — 2 Bedroom",
    category: "moving",
    proposalStatus: "pending",
    postedAgo: "4d",
    budget: 2100,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "9",
    title: "Bathroom Sink Leak Repair",
    category: "plumbing",
    proposalStatus: "accepted",
    postedAgo: "12h",
    budget: 350,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "10",
    title: "Ceiling Fan Installation",
    category: "electrical",
    proposalStatus: "pending",
    postedAgo: "3h",
    budget: 500,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1631545806609-cfd9c0e5d1c5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "11",
    title: "Weekly Office Deep Clean Contract",
    category: "cleaning",
    proposalStatus: "accepted",
    postedAgo: "1h",
    budget: 900,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "12",
    title: "Fence Painting — Backyard",
    category: "painting",
    proposalStatus: "pending",
    postedAgo: "2w",
    budget: 700,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "13",
    title: "AC Unit Maintenance and Filter Replacement",
    category: "other",
    proposalStatus: "accepted",
    postedAgo: "2d",
    budget: 250,
    currency: "MXN",
    imageUrl:
      "https://images.unsplash.com/photo-1631545308772-81a0e0a3a6ce?auto=format&fit=crop&w=1200&q=80",
  },
];
