import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { requireRole, getSessionContext } from "@/lib/rbac";
import { writeAudit } from "@/lib/audit";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createContent, listContents } from "@/server/repositories/contents";

const CreateBody = z.object({
  title: z.string().min(1),
  kind: z.enum(["article", "video", "pdf", "quiz", "link", "note"]),
  body: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const items = await listContents();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const parsed = CreateBody.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  const { hospitalId } = getSessionContext(session);
  const created = await createContent((session.user as any).id, parsed.data);
  await writeAudit({ actorId: (session.user as any).id, hospitalId, action: "CONTENT_CREATE", entityType: "ContentPiece", entityId: created.id, diff: parsed.data as any });
  return NextResponse.json(created, { status: 201 });
}


