import { prisma } from "@/lib/prisma";

export async function getDraftLayout(hospitalId: string) {
  let layout = await prisma.homeLayout.findUnique({ where: { hospitalId } });
  if (!layout) {
    layout = await prisma.homeLayout.create({ data: { hospitalId, cardIds: [], version: 1 } });
  }
  return layout;
}

export async function updateDraftLayout(hospitalId: string, cardIds: string[]) {
  return prisma.homeLayout.update({ where: { hospitalId }, data: { cardIds } as any });
}

export async function publishLayout(hospitalId: string) {
  const layout = await getDraftLayout(hospitalId);
  const cards = await prisma.card.findMany({ orderBy: { order: "asc" } });
  const contents = await prisma.contentPiece.findMany({ where: { deletedAt: null } });
  const collections = await prisma.collection.findMany({ where: { deletedAt: null } });
  const nextVersion = (layout.publishedVersion ?? 0) + 1;
  await prisma.layoutVersion.create({
    data: {
      hospitalId,
      version: nextVersion,
      snapshot: { cards, contents, collections, layout } as any,
    },
  });
  await prisma.homeLayout.update({ where: { hospitalId }, data: { publishedVersion: nextVersion, version: { increment: 1 } } });
  return nextVersion;
}

export async function rollbackLayout(hospitalId: string, version: number) {
  const snap = await prisma.layoutVersion.findUnique({ where: { hospitalId_version: { hospitalId, version } } });
  if (!snap) throw new Error("NOT_FOUND");
  // For demo: just set publishedVersion pointer; in a full system we'd restore entities
  await prisma.homeLayout.update({ where: { hospitalId }, data: { publishedVersion: version } });
}


