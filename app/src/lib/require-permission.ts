import "server-only";
import { requireUser } from "@/lib/current-user";
import { canApprove, canEdit, canView } from "@/lib/permissions";
import type { User } from "@/generated/prisma/client";

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export type PermissionLevelCheck = "view" | "edit" | "approve";

// Every mutation re-checks permission here, server-side, regardless of what
// the client UI showed — the client-side canEdit() in the reference prototype
// was cosmetic and bypassable; this is the real gate.
export async function requirePermission(moduleKey: string, level: PermissionLevelCheck = "edit"): Promise<User> {
  const user = await requireUser();

  const allowed =
    level === "approve" ? await canApprove(user.role, moduleKey)
    : level === "view" ? await canView(user.role, moduleKey)
    : await canEdit(user.role, moduleKey);

  if (!allowed) {
    throw new ForbiddenError(`Role "${user.role}" does not have "${level}" permission on module "${moduleKey}"`);
  }

  return user;
}
