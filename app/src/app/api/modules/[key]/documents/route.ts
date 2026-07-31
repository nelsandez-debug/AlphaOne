import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, ForbiddenError } from "@/lib/require-permission";
import { UnauthenticatedError } from "@/lib/current-user";

// Demonstrates the shared, polymorphic Document repository (record_type + record_id)
// that every future module reuses, gated by the server-side permission check for
// the module named in the URL — not by anything the client sends.
export async function POST(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key: moduleKey } = await params;

  let user;
  try {
    user = await requirePermission(moduleKey, "edit");
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    throw err;
  }

  const body = await request.json();
  if (!body?.recordType || !body?.recordId || !body?.name) {
    return NextResponse.json({ error: "recordType, recordId, and name are required" }, { status: 400 });
  }

  const document = await prisma.document.create({
    data: {
      recordType: body.recordType,
      recordId: body.recordId,
      name: body.name,
      sizeKB: body.sizeKB,
      uploadedById: user.id,
    },
  });

  await prisma.auditLogEntry.create({
    data: {
      recordType: body.recordType,
      recordId: body.recordId,
      actorId: user.id,
      action: `Uploaded document "${document.name}"`,
    },
  });

  return NextResponse.json(document, { status: 201 });
}
