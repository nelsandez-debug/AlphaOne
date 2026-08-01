import type { ContractStatus, RiskLevel, ServiceCriticality, SupplierStatus, SupplierTier } from "@/generated/prisma/enums";

export const SUPPLIER_TIER_LABELS: Record<SupplierTier, string> = {
  STRATEGIC: "Strategic",
  PREFERRED: "Preferred",
  PARTNER: "Partner",
  TRANSACTIONAL: "Transactional",
  UNMANAGED: "Unmanaged",
};

export const SUPPLIER_STATUS_LABELS: Record<SupplierStatus, string> = {
  PREFERRED: "Preferred",
  APPROVED: "Approved",
  UNDER_REVIEW: "Under Review",
  PENDING_ONBOARDING: "Pending Onboarding",
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: "Draft",
  PENDING_SIGNATURE: "Pending Signature",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  BREACH_FLAGGED: "Breach Flagged",
};

export const SERVICE_CRITICALITY_LABELS: Record<ServiceCriticality, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

export function riskBadgeClass(level: RiskLevel | null | undefined): string {
  switch (level) {
    case "HIGH":
      return "bg-red-50 text-red-700 border-red-200";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "LOW":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}
