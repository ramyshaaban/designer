import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const tpl = await prisma.template.findUnique({ where: { id: params.id } });
  if (!tpl) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(tpl);
}


