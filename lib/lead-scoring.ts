import { LeadFormData, ScoreLabel } from "@/types/lead";

const BUDGET_SCORES: Record<string, number> = {
  "$5,000+": 30,
  "$2,000–$5,000": 22,
  "$1,000–$2,000": 15,
  "Under $1,000": 8,
  "Not sure": 4,
};

const URGENCY_SCORES: Record<string, number> = {
  "Immediately / ASAP": 25,
  "Within 1 week": 20,
  "This month": 12,
  "Next 3 months": 6,
  "Just browsing": 2,
};

export function calculateLeadScore(data: LeadFormData): number {
  let score = 0;

  if (data.phone && data.phone.replace(/\D/g, "").length >= 10) score += 20;
  if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) score += 15;
  score += BUDGET_SCORES[data.budget] ?? 0;
  score += URGENCY_SCORES[data.urgency] ?? 0;
  if (data.service && data.service.trim().length > 0) score += 10;

  return Math.min(score, 100);
}

export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 80)
    return {
      label: "Hot Lead 🔥",
      colorClass: "text-green-400",
      bgClass: "bg-green-900/40 border-green-700",
    };
  if (score >= 60)
    return {
      label: "Warm Lead",
      colorClass: "text-yellow-400",
      bgClass: "bg-yellow-900/40 border-yellow-700",
    };
  if (score >= 40)
    return {
      label: "Cool Lead",
      colorClass: "text-orange-400",
      bgClass: "bg-orange-900/40 border-orange-700",
    };
  return {
    label: "Cold Lead",
    colorClass: "text-red-400",
    bgClass: "bg-red-900/40 border-red-700",
  };
}
