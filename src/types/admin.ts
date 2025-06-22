
export interface Registration {
  id: string;
  fullName: string;
  mobileNumber: string;
  whatsappNumber: string;
  address: string;
  panchayathDetails: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  uniqueId?: string;
}

export interface CategoryFee {
  category: string;
  actualFee: number;
  offerFee: number;
  hasOffer: boolean;
  image?: string;
}

export const categories = [
  { value: "pennyekart-free", label: "Pennyekart Free Registration" },
  { value: "pennyekart-paid", label: "Pennyekart Paid Registration" },
  { value: "farmelife", label: "FarmeLife" },
  { value: "foodelife", label: "FoodeLife" },
  { value: "organelife", label: "OrganeLife" },
  { value: "entrelife", label: "EntreLife" },
  { value: "job-card", label: "Job Card (All Categories)" }
];
