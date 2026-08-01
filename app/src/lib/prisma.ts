import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Local dev / tests / Node builds: DATABASE_URL is a real Postgres connection
// string and PrismaPg opens a normal TCP connection.
//
// Deployed on Cloudflare Workers: there is no DATABASE_URL env var. Postgres
// is reached through the Hyperdrive binding instead. The Cloudflare context
// (incl. bindings) is put on globalThis by the Worker entrypoint before any
// app code runs for a request, so a plain sync `getCloudflareContext()` call
// — not the `{ async: true }` dev-only wrangler-proxy path — is what resolves
// it here; this module is only ever first imported while handling a request,
// never at cold-start before one exists, so the binding is always present by
// the time this runs.
function resolveConnectionString(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const { env } = getCloudflareContext();
  const hyperdrive = (env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE;
  if (!hyperdrive) {
    throw new Error("No DATABASE_URL and no HYPERDRIVE binding — cannot connect to Postgres.");
  }
  return hyperdrive.connectionString;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: resolveConnectionString() });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
