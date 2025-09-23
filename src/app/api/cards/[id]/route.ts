import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { requireRole, getSessionContext } from "@/lib/rbac";
import { writeAudit } from "@/lib/audit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteCard, updateCard } from "@/server/repositories/cards";
import { prisma } from "@/lib/prisma";

const UpdateCardBody = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(["content", "collection"]).optional(),
  contentId: z.string().nullable().optional(),
  collectionId: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  layout: z.object({ w: z.number().int().positive(), h: z.number().int().positive() }).optional(),
  order: z.number().int().optional(),
  visible: z.boolean().optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const card = await prisma.card.findUnique({ where: { id: params.id } });
  if (!card) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(card);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const parse = UpdateCardBody.safeParse(await req.json());
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 422 });
  }
  const before = await prisma.card.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const updated = await updateCard(params.id, parse.data);
  const { hospitalId } = getSessionContext(session);
  await writeAudit({
    actorId: (session.user as any).id,
    hospitalId,
    action: "CARD_UPDATE",
    entityType: "Card",
    entityId: params.id,
    diff: { before, after: updated } as any,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const before = await prisma.card.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  await deleteCard(params.id);
  const { hospitalId } = getSessionContext(session);
  await writeAudit({
    actorId: (session.user as any).id,
    hospitalId,
    action: "CARD_DELETE",
    entityType: "Card",
    entityId: params.id,
    diff: { before } as any,
  });
  return NextResponse.json({ ok: true });
}


