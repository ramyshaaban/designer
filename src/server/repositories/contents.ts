import { prisma } from "@/lib/prisma";

export type ContentCreateInput = {
  title: string;
  kind: "article" | "video" | "pdf" | "quiz" | "link" | "note";
  body?: string | null;
  mediaUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  tags?: string[] | null;
};

export type ContentUpdateInput = Partial<ContentCreateInput>;

export async function listContents() {
  return prisma.contentPiece.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
}

export async function createContent(actorId: string, input: ContentCreateInput) {
  return prisma.contentPiece.create({
    data: {
      title: input.title,
      kind: input.kind,
      body: input.body ?? null,
      mediaUrl: input.mediaUrl ?? null,
      metadata: (input.metadata as any) ?? null,
      tags: (input.tags as any) ?? null,
      createdById: actorId,
    },
  });
}

export async function updateContent(id: string, input: ContentUpdateInput) {
  return prisma.contentPiece.update({
    where: { id },
    data: {
      title: input.title,
      kind: input.kind,
      body: input.body,
      mediaUrl: input.mediaUrl,
      metadata: (input.metadata as any) ?? undefined,
      tags: (input.tags as any) ?? undefined,
    },
  });
}

export async function softDeleteContent(id: string) {
  return prisma.contentPiece.update({ where: { id }, data: { deletedAt: new Date() } });
}


