import { authOptions } from "@/lib/auth";
import { requireRole, getSessionContext } from "@/lib/rbac";
import { writeAudit } from "@/lib/audit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createCard, listCards } from "@/server/repositories/cards";
import { getServerSession } from "next-auth";

const CreateCardBody = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["content", "collection"]),
  contentId: z.string().optional(),
  collectionId: z.string().optional(),
  icon: z.string().optional(),
  layout: z.object({ w: z.number().int().positive(), h: z.number().int().positive() }),
  visible: z.boolean().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { hospitalId } = getSessionContext(session);
  const cards = await listCards(hospitalId);
  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const parse = CreateCardBody.safeParse(await req.json());
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 422 });
  }
  const { hospitalId } = getSessionContext(session);
  const created = await createCard({ input: parse.data, actorId: (session.user as any).id });
  await writeAudit({
    actorId: (session.user as any).id,
    hospitalId,
    action: "CARD_CREATE",
    entityType: "Card",
    entityId: created.id,
    diff: parse.data as any,
  });
  return NextResponse.json(created, { status: 201 });
}


