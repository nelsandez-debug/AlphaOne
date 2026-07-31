import "server-only";
import { prisma } from "@/lib/prisma";
import { PermissionLevel, Role } from "@/generated/prisma/enums";

const LEVEL_RANK: Record<PermissionLevel, number> = {
  NONE: 0,
  VIEW: 1,
  EDIT: 2,
  APPROVE: 3,
};

// The DB-backed equivalent of the reference prototype's permissionLevel(role, moduleLabel):
// reads the same (role, module) -> level relation shown in Administration -> Roles & Permissions,
// so a change made there is the same data gating every server-side check.
export async function permissionLevel(role: Role, moduleKey: string): Promise<PermissionLevel> {
  const permission = await prisma.rolePermission.findFirst({
    where: { role, module: { key: moduleKey } },
  });
  return permission?.level ?? PermissionLevel.NONE;
}

export async function canView(role: Role, moduleKey: string): Promise<boolean> {
  return LEVEL_RANK[await permissionLevel(role, moduleKey)] >= LEVEL_RANK.VIEW;
}

export async function canEdit(role: Role, moduleKey: string): Promise<boolean> {
  return LEVEL_RANK[await permissionLevel(role, moduleKey)] >= LEVEL_RANK.EDIT;
}

export async function canApprove(role: Role, moduleKey: string): Promise<boolean> {
  return (await permissionLevel(role, moduleKey)) === PermissionLevel.APPROVE;
}
