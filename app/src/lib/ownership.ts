import "server-only";
import { prisma } from "@/lib/prisma";

const RECORD_TYPE_PATH: Record<string, string> = {
  supplier: "/suppliers",
  contract: "/contracts",
  service: "/services",
  intake_request: "/intake",
  sourcing_event: "/sourcing",
  purchase_order: "/purchase-orders",
  invoice: "/invoices",
  project: "/projects",
};

export type ResolvedRecord = { label: string; href: string };

// The polymorphic Ownership table (recordType + recordId) has no FK to the
// target record — by design, since one table serves every module (same
// reasoning as Document/Note/AuditLogEntry). To show a human-readable label for
// the Administration -> Ownership hub, resolve each recordType against its own
// table, batched per type rather than one query per row.
export async function resolveOwnershipRecords(
  entries: { recordType: string; recordId: string }[]
): Promise<Map<string, ResolvedRecord>> {
  const idsByType = new Map<string, Set<string>>();
  for (const e of entries) {
    if (!idsByType.has(e.recordType)) idsByType.set(e.recordType, new Set());
    idsByType.get(e.recordType)!.add(e.recordId);
  }

  const resolved = new Map<string, ResolvedRecord>();
  const path = (type: string) => RECORD_TYPE_PATH[type] ?? "";

  const supplierIds = idsByType.get("supplier");
  if (supplierIds) {
    const rows = await prisma.supplier.findMany({ where: { id: { in: [...supplierIds] } }, select: { id: true, name: true } });
    for (const r of rows) resolved.set(`supplier:${r.id}`, { label: r.name, href: `${path("supplier")}/${r.id}` });
  }
  const contractIds = idsByType.get("contract");
  if (contractIds) {
    const rows = await prisma.contract.findMany({ where: { id: { in: [...contractIds] } }, select: { id: true, name: true } });
    for (const r of rows) resolved.set(`contract:${r.id}`, { label: r.name, href: `${path("contract")}/${r.id}` });
  }
  const serviceIds = idsByType.get("service");
  if (serviceIds) {
    const rows = await prisma.service.findMany({ where: { id: { in: [...serviceIds] } }, select: { id: true, name: true } });
    for (const r of rows) resolved.set(`service:${r.id}`, { label: r.name, href: `${path("service")}/${r.id}` });
  }
  const intakeIds = idsByType.get("intake_request");
  if (intakeIds) {
    const rows = await prisma.intakeRequest.findMany({ where: { id: { in: [...intakeIds] } }, select: { id: true, title: true } });
    for (const r of rows) resolved.set(`intake_request:${r.id}`, { label: r.title, href: `${path("intake_request")}/${r.id}` });
  }
  const sourcingIds = idsByType.get("sourcing_event");
  if (sourcingIds) {
    const rows = await prisma.sourcingEvent.findMany({ where: { id: { in: [...sourcingIds] } }, select: { id: true, title: true } });
    for (const r of rows) resolved.set(`sourcing_event:${r.id}`, { label: r.title, href: `${path("sourcing_event")}/${r.id}` });
  }
  const poIds = idsByType.get("purchase_order");
  if (poIds) {
    const rows = await prisma.purchaseOrder.findMany({ where: { id: { in: [...poIds] } }, select: { id: true } });
    for (const r of rows) resolved.set(`purchase_order:${r.id}`, { label: `PO-${r.id.slice(-6).toUpperCase()}`, href: `${path("purchase_order")}/${r.id}` });
  }
  const invoiceIds = idsByType.get("invoice");
  if (invoiceIds) {
    const rows = await prisma.invoice.findMany({ where: { id: { in: [...invoiceIds] } }, select: { id: true } });
    for (const r of rows) resolved.set(`invoice:${r.id}`, { label: `INV-${r.id.slice(-6).toUpperCase()}`, href: `${path("invoice")}/${r.id}` });
  }
  const projectIds = idsByType.get("project");
  if (projectIds) {
    const rows = await prisma.project.findMany({ where: { id: { in: [...projectIds] } }, select: { id: true, name: true } });
    for (const r of rows) resolved.set(`project:${r.id}`, { label: r.name, href: `${path("project")}/${r.id}` });
  }

  return resolved;
}
