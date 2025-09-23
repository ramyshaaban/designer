import { auth } from "@/lib/auth";
import { requireRole, getSessionContext } from "@/lib/rbac";
import { writeAudit } from "@/lib/audit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { softDeleteCollection, updateCollection } from "@/server/repositories/collections";

const UpdateBody = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  itemIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const item = await prisma.collection.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const parsed = UpdateBody.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  const before = await prisma.collection.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const updated = await updateCollection(params.id, parsed.data);
  const { hospitalId } = getSessionContext(session);
  await writeAudit({ actorId: (session.user as any).id, hospitalId, action: "COLLECTION_UPDATE", entityType: "Collection", entityId: params.id, diff: { before, after: updated } as any });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const before = await prisma.collection.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  await softDeleteCollection(params.id);
  const { hospitalId } = getSessionContext(session);
  await writeAudit({ actorId: (session.user as any).id, hospitalId, action: "COLLECTION_DELETE", entityType: "Collection", entityId: params.id, diff: { before } as any });
  return NextResponse.json({ ok: true });
}


