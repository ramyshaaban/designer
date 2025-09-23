import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionContext, requireRole } from "@/lib/rbac";
import { rollbackLayout } from "@/server/repositories/layout";
import { z } from "zod";
import { writeAudit } from "@/lib/audit";

const Body = z.object({ version: z.number().int().positive() });

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  const { hospitalId } = getSessionContext(session);
  await rollbackLayout(hospitalId, parsed.data.version);
  await writeAudit({ actorId: (session.user as any).id, hospitalId, action: "LAYOUT_ROLLBACK", entityType: "HomeLayout", entityId: hospitalId, diff: { version: parsed.data.version } });
  return NextResponse.json({ ok: true });
}


