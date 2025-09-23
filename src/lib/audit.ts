import { prisma } from "@/lib/prisma";

export async function writeAudit(params: {
  actorId: string;
  hospitalId: string;
  action: string;
  entityType: "Card" | "ContentPiece" | "Collection" | "HomeLayout" | "Template";
  entityId: string;
  diff?: Record<string, unknown>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        hospitalId: params.hospitalId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        diff: params.diff as any,
      },
    });
  } catch (err) {
    console.error("audit_failed", err);
  }
}


