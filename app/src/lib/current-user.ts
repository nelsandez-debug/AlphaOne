import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role, type User } from "@/generated/prisma/client";

// New Clerk sign-ups default to the least-privileged role until an admin
// assigns a real one via Administration -> Roles & Permissions (Phase 6).
const DEFAULT_ROLE: Role = Role.BUYER;

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (Object.values(Role) as string[]).includes(value);
}

// Looks up (or lazily provisions) the real `User` row behind the signed-in Clerk
// session, so every document/note/audit-log FK points at a real user, not a
// bare Clerk ID string.
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const role = isRole(clerkUser.publicMetadata?.role) ? (clerkUser.publicMetadata.role as Role) : DEFAULT_ROLE;
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? `${userId}@unknown.local`;
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || email;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId, email, name, role },
  });
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("Unauthenticated");
    this.name = "UnauthenticatedError";
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthenticatedError();
  return user;
}
