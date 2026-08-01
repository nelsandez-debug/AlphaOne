import "server-only";
import { redirect } from "next/navigation";
import { requireUser, UnauthenticatedError } from "@/lib/current-user";
import { canEdit, canView } from "@/lib/permissions";
import type { User } from "@/generated/prisma/client";

export type PageAccess = { user: User; allowed: boolean; editable: boolean };

// Server Component equivalent of requirePermission: pages can't return a 403
// response, so an insufficient role renders an in-page "no access" message
// instead (same idea as the reference's Gated component) while an
// unauthenticated visitor is sent to sign in.
export async function requirePageAccess(moduleKey: string): Promise<PageAccess> {
  let user: User;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof UnauthenticatedError) redirect("/sign-in");
    throw err;
  }

  const allowed = await canView(user.role, moduleKey);
  if (!allowed) return { user, allowed: false, editable: false };

  const editable = await canEdit(user.role, moduleKey);
  return { user, allowed: true, editable };
}
