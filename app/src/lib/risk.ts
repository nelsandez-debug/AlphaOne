import "server-only";
import { prisma } from "@/lib/prisma";

const SEVERITY_WEIGHT = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;

// A simple, transparent heuristic — NOT a machine-learning or AI-generated score
// (per CLAUDE.md principle 4, no feature claims to be AI-driven unless it actually
// calls a model). It's just: unresolved flags weighted by severity, plus the
// average assessed Supplier.riskScore, capped at 100.
export async function computeRiskIndex(): Promise<number> {
  const [openFlags, suppliers] = await Promise.all([
    prisma.riskFlag.findMany({ where: { resolved: false }, select: { severity: true } }),
    prisma.supplier.findMany({ where: { riskScore: { not: null } }, select: { riskScore: true } }),
  ]);

  const flagScore = openFlags.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0) * 5;
  const avgSupplierRisk = suppliers.length
    ? suppliers.reduce((sum, s) => sum + (s.riskScore ?? 0), 0) / suppliers.length
    : 0;

  return Math.min(100, Math.round(flagScore + avgSupplierRisk * 0.3));
}
