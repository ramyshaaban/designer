import { prisma } from "@/lib/prisma";

export type CollectionCreateInput = {
  title: string;
  description?: string | null;
  itemIds: string[];
  tags?: string[] | null;
};

export type CollectionUpdateInput = Partial<CollectionCreateInput>;

export async function listCollections() {
  return prisma.collection.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } });
}

export async function createCollection(actorId: string, input: CollectionCreateInput) {
  return prisma.collection.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      itemIds: input.itemIds as any,
      tags: (input.tags as any) ?? null,
      createdById: actorId,
    },
  });
}

export async function updateCollection(id: string, input: CollectionUpdateInput) {
  return prisma.collection.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      itemIds: (input.itemIds as any) ?? undefined,
      tags: (input.tags as any) ?? undefined,
    },
  });
}

export async function softDeleteCollection(id: string) {
  return prisma.collection.update({ where: { id }, data: { deletedAt: new Date() } });
}


