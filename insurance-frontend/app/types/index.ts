// types/index.ts

// types/index.ts

export interface Plan {
  id: string;
  name: string;
  type: string;
  description: string;
  coverageAmount: number;
  monthlyPremium: number;
  durationMonths: number; // Exists in insurance_plans table [cite: 6]
  isActive: boolean;
  createdAt: string;
}

export interface Policy {
  id: string;
  userId: string;
  userFullName: string;
  planId: string;
  
  // These fields come from the JOIN with insurance_plans [cite: 6]
  planName: string;
  planType: string;
  durationMonths: number; // ADD THIS: To show the policy term [cite: 6]
  coverageAmount: number; // ADD THIS: To show total protection value [cite: 6]
  
  status: string;
  startDate: string; // matches start_date in DB [cite: 6]
  endDate: string;   // matches end_date in DB [cite: 6]
  adminNote: string | null;
  createdAt: string;
}

export interface Claim {
  id: string;
  policyId: string;
  userFullName: string;
  planName: string;
  reason: string;
  amountRequested: number; // matches amount_requested in DB [cite: 6]
  status: string;
  adminNote: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  policyId: string;
  userFullName: string;
  planName: string;
  amount: number;
  monthYear: string; // matches month_year in DB [cite: 6]
  paymentDate: string; // matches payment_date in DB [cite: 6]
  status: string;
  receiptUrl: string | null;
  adminNote: string | null;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalPolicies: number;
  totalClaims: number;
  totalPayments: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}