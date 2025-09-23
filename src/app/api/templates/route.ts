import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { requireRole } from "@/lib/rbac";

const CreateBody = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  payload: z.any(),
  tags: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const items = await prisma.template.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    requireRole(session, ["admin"]);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const parsed = CreateBody.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  const created = await prisma.template.create({ data: parsed.data as any });
  return NextResponse.json(created, { status: 201 });
}


