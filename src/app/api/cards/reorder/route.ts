import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { requireRole, getSessionContext } from "@/lib/rbac";
import { writeAudit } from "@/lib/audit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { reorderCards } from "@/server/repositories/cards";

const Body = z.object({ ids: z.array(z.string()).min(1) });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  const before = parsed.data.ids;
  await reorderCards(parsed.data.ids);
  const { hospitalId } = getSessionContext(session);
  await writeAudit({
    actorId: (session.user as any).id,
    hospitalId,
    action: "CARD_REORDER",
    entityType: "Card",
    entityId: "*",
    diff: { order: before } as any,
  });
  return NextResponse.json({ ok: true });
}


