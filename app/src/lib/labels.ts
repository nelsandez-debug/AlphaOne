import type {
  BusinessReviewStatus,
  BusinessReviewType,
  ContractStatus,
  IntakeRequestType,
  IntakeStage,
  InvoiceStatus,
  POStatus,
  POType,
  ProjectStatus,
  RiskLevel,
  ServiceCriticality,
  SourcingParticipantStatus,
  SourcingStage,
  SupplierStatus,
  SupplierTier,
  ValueStatus,
  ValueType,
  VendorSlaStatus,
} from "@/generated/prisma/enums";

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

export const INTAKE_REQUEST_TYPE_LABELS: Record<IntakeRequestType, string> = {
  SERVICE_REQUEST: "Service Request",
  NEW_VENDOR: "New Vendor",
  CONTRACT_REQUEST: "Contract Request",
  CONTRACT_CHANGE: "Contract Change",
  PURCHASE_REQUEST: "Purchase Request",
  NEW_PROJECT: "New Project",
  SOURCING_EVENT: "RFx / Sourcing Event",
};

export const INTAKE_STAGE_LABELS: Record<IntakeStage, string> = {
  NEW: "New",
  TRIAGE: "Triage",
  ROUTED: "Routed",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
};

export function stageDotClass(stage: IntakeStage): string {
  switch (stage) {
    case "CLOSED":
      return "bg-emerald-500";
    case "IN_PROGRESS":
      return "bg-[#2563EB]";
    case "ROUTED":
      return "bg-[#16A34A]";
    case "TRIAGE":
      return "bg-amber-400";
    default:
      return "bg-slate-300";
  }
}

export const SOURCING_STAGE_LABELS: Record<SourcingStage, string> = {
  MARKET_SCAN: "Market Scan",
  BID_EVALUATION: "Bid Evaluation",
  AWARD_OPTIMIZATION: "Award Optimization",
  CLOSED: "Closed",
};

export const SOURCING_PARTICIPANT_STATUS_LABELS: Record<SourcingParticipantStatus, string> = {
  INVITED: "Invited",
  RESPONDED: "Responded",
  SHORTLISTED: "Shortlisted",
  AWARDED: "Awarded",
  DECLINED: "Declined",
};

export const PO_TYPE_LABELS: Record<POType, string> = {
  STANDARD: "Standard",
  BLANKET: "Blanket",
  SERVICE: "Service",
  EMERGENCY: "Emergency",
  RECURRING: "Recurring",
};

export const PO_STATUS_LABELS: Record<POStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending Approval",
  ISSUED: "Issued",
  RECEIVED: "Received",
  CLOSED: "Closed",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: "Pending",
  MATCHED: "Matched",
  EXCEPTION: "Exception",
  DISPUTED: "Disputed",
  PAID: "Paid",
};

export const VENDOR_SLA_STATUS_LABELS: Record<VendorSlaStatus, string> = {
  MET: "Met",
  AT_RISK: "At Risk",
  BREACHED: "Breached",
  NOT_TRACKED: "Not tracked",
};

export const BUSINESS_REVIEW_TYPE_LABELS: Record<BusinessReviewType, string> = {
  QBR: "QBR",
  ANNUAL_REVIEW: "Annual Review",
};

export const BUSINESS_REVIEW_STATUS_LABELS: Record<BusinessReviewStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED_ON_TIME: "Completed On-Time",
  COMPLETED_LATE: "Completed Late",
  OVERDUE: "Overdue",
};

export function invoiceStatusBadgeClass(status: InvoiceStatus): string {
  switch (status) {
    case "MATCHED":
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "EXCEPTION":
    case "DISPUTED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export function vendorSlaStatusBadgeClass(status: VendorSlaStatus): string {
  switch (status) {
    case "MET":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "AT_RISK":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "BREACHED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ON_TRACK: "On Track",
  AT_RISK: "At Risk",
  DELAYED: "Delayed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const VALUE_TYPE_LABELS: Record<ValueType, string> = {
  SAVINGS: "Savings",
  COST_AVOIDANCE: "Cost Avoidance",
  PAYMENT_TERMS_IMPROVEMENT: "Payment Terms Improvement",
};

export const VALUE_STATUS_LABELS: Record<ValueStatus, string> = {
  PENDING_FINANCE_APPROVAL: "Pending Finance Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function projectStatusBadgeClass(status: ProjectStatus): string {
  switch (status) {
    case "ON_TRACK":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "AT_RISK":
    case "DELAYED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export function valueStatusBadgeClass(status: ValueStatus): string {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

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
