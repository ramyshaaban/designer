import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getSessionContext, requireRole } from "@/lib/rbac";
import { publishLayout } from "@/server/repositories/layout";
import { writeAudit } from "@/lib/audit";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const { hospitalId } = getSessionContext(session);
  const version = await publishLayout(hospitalId);
  await writeAudit({ actorId: (session.user as any).id, hospitalId, action: "LAYOUT_PUBLISH", entityType: "HomeLayout", entityId: hospitalId, diff: { version } });
  return NextResponse.json({ version });
}


