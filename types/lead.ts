export type LeadStatus = "new" | "contacted" | "qualified" | "booked" | "lost";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  business_type: string;
  service: string;
  budget: string;
  urgency: string;
  notes: string;
  lead_score: number;
  status: LeadStatus;
  suggested_sms: string;
  suggested_email: string;
  created_at: string;
}

export interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  business_type: string;
  service: string;
  budget: string;
  urgency: string;
  notes: string;
}

export interface LeadResponse {
  success: boolean;
  lead?: Lead;
  error?: string;
}

export interface ScoreLabel {
  label: string;
  colorClass: string;
  bgClass: string;
}
