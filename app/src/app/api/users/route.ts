import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, UnauthenticatedError } from "@/lib/current-user";

// Any authenticated user can see the (name, role) directory — needed to populate
// owner-assignment pickers. Not gated by a specific module's permission level since
// it isn't itself a module's data.
export async function GET() {
  try {
    await requireUser();
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}
