import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSessionContext, requireRole } from "@/lib/rbac";
import { getDraftLayout, updateDraftLayout } from "@/server/repositories/layout";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { hospitalId } = getSessionContext(session);
  const layout = await getDraftLayout(hospitalId);
  return NextResponse.json(layout);
}

const UpdateBody = z.object({ cardIds: z.array(z.string()) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin", "editor"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const parsed = UpdateBody.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  const { hospitalId } = getSessionContext(session);
  const updated = await updateDraftLayout(hospitalId, parsed.data.cardIds);
  return NextResponse.json(updated);
}


