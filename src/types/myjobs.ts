export type ProposalStatus =
  | "accepted"
  | "pending"
  | "rejected"
  | "counteroffer";

export interface MyJob {
  id: string;
  id_servicio: number;
  title: string;
  category: string;
  proposalStatus: ProposalStatus;
  postedAgo: string;
  budget: number;
  currency: string;
  imageUrl?: string;
}
