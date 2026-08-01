import "server-only";
import { NextResponse } from "next/server";
import { requirePermission, ForbiddenError, type PermissionLevelCheck } from "@/lib/require-permission";
import { UnauthenticatedError } from "@/lib/current-user";
import type { User } from "@/generated/prisma/client";

type GuardResult = { user: User; response?: undefined } | { user?: undefined; response: NextResponse };

// Shared by every Route Handler that mutates or reads a permissioned record: turns
// the requirePermission() exceptions into the right HTTP response, so each route
// just does `const guard = await guardPermission(...); if (guard.response) return guard.response;`
// instead of repeating the same try/catch.
export async function guardPermission(moduleKey: string, level: PermissionLevelCheck): Promise<GuardResult> {
  try {
    const user = await requirePermission(moduleKey, level);
    return { user };
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return { response: NextResponse.json({ error: err.message }, { status: 403 }) };
    }
    if (err instanceof UnauthenticatedError) {
      return { response: NextResponse.json({ error: err.message }, { status: 401 }) };
    }
    throw err;
  }
}
