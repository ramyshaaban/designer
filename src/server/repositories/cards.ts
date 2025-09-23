import { prisma } from "@/lib/prisma";
import { CardType } from "@prisma/client";

export type CardCreateInput = {
  title: string;
  description?: string;
  type: "content" | "collection";
  contentId?: string | null;
  collectionId?: string | null;
  icon?: string | null;
  layout: { w: number; h: number };
  visible?: boolean;
};

export type CardUpdateInput = Partial<CardCreateInput> & { order?: number };

export async function listCards(hospitalId: string) {
  // All cards belong implicitly to a hospital through layout ordering; here we list all cards
  return prisma.card.findMany({ orderBy: { order: "asc" } });
}

export async function createCard(params: {
  input: CardCreateInput;
  actorId: string;
}) {
  const maxOrder = await prisma.card.aggregate({ _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;
  return prisma.card.create({
    data: {
      title: params.input.title,
      description: params.input.description,
      type: params.input.type as CardType,
      contentId: params.input.contentId ?? null,
      collectionId: params.input.collectionId ?? null,
      icon: params.input.icon ?? null,
      layout: params.input.layout as any,
      order: nextOrder,
      visible: params.input.visible ?? true,
      createdById: params.actorId,
    },
  });
}

export async function updateCard(id: string, input: CardUpdateInput) {
  return prisma.card.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      type: input.type ? (input.type as CardType) : undefined,
      contentId: input.contentId ?? undefined,
      collectionId: input.collectionId ?? undefined,
      icon: input.icon ?? undefined,
      layout: input.layout ? (input.layout as any) : undefined,
      order: input.order,
      visible: input.visible,
    },
  });
}

export async function deleteCard(id: string) {
  return prisma.card.delete({ where: { id } });
}

export async function reorderCards(idsInOrder: string[]) {
  await prisma.$transaction(
    idsInOrder.map((id, index) =>
      prisma.card.update({ where: { id }, data: { order: index + 1 } })
    )
  );
}


