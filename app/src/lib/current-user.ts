import "server-only";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
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
  // Clerk's `auth()` helper hard-requires clerkMiddleware() to have run (it
  // asserts on a request header middleware injects). Next 16's proxy.ts is
  // Node-runtime-only and incompatible with OpenNext-Cloudflare (see
  // CLAUDE.md), so there is no middleware to inject it. authenticateRequest()
  // is the same primitive clerkMiddleware() calls internally, just invoked
  // directly here instead, with no middleware dependency.
  const client = await clerkClient();
  const request = new NextRequest("https://placeholder.local", { headers: await headers() });
  const requestState = await client.authenticateRequest(request);
  const userId = requestState.toAuth()?.userId;
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

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
