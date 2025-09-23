import { auth } from "@/lib/auth";
import { requireRole, getSessionContext } from "@/lib/rbac";
import { writeAudit } from "@/lib/audit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { softDeleteContent, updateContent } from "@/server/repositories/contents";

const UpdateBody = z.object({
  title: z.string().min(1).optional(),
  kind: z.enum(["article", "video", "pdf", "quiz", "link", "note"]).optional(),
  body: z.string().optional(),
  mediaUrl: z.string().url().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const item = await prisma.contentPiece.findUnique({ where: { id: params.id } });
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
  const before = await prisma.contentPiece.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const updated = await updateContent(params.id, parsed.data);
  const { hospitalId } = getSessionContext(session);
  await writeAudit({ actorId: (session.user as any).id, hospitalId, action: "CONTENT_UPDATE", entityType: "ContentPiece", entityId: params.id, diff: { before, after: updated } as any });
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
  const before = await prisma.contentPiece.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  await softDeleteContent(params.id);
  const { hospitalId } = getSessionContext(session);
  await writeAudit({ actorId: (session.user as any).id, hospitalId, action: "CONTENT_DELETE", entityType: "ContentPiece", entityId: params.id, diff: { before } as any });
  return NextResponse.json({ ok: true });
}


