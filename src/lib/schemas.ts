import { z } from "zod";

export const CardTypeSchema = z.enum(["content", "collection"]);

export const CardSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: CardTypeSchema,
  contentId: z.string().optional(),
  collectionId: z.string().optional(),
  icon: z.string().optional(),
  layout: z.object({ w: z.number().int().positive(), h: z.number().int().positive() }),
  order: z.number().int(),
  visible: z.boolean(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

export const ContentPieceSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  kind: z.enum(["article", "video", "pdf", "quiz", "link", "note"]),
  body: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

export const CollectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  itemIds: z.array(z.string()),
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
});

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  payload: z.object({
    cards: z.array(CardSchema),
    contents: z.array(ContentPieceSchema),
    collections: z.array(CollectionSchema),
  }),
  tags: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().optional(),
});

export const HomeLayoutSchema = z.object({
  id: z.string(),
  hospitalId: z.string(),
  cardIds: z.array(z.string()),
  version: z.number().int(),
  publishedVersion: z.number().int().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer"]),
  hospitalId: z.string(),
});

export const AuditLogSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  hospitalId: z.string(),
  action: z.string(),
  entityType: z.enum(["Card", "ContentPiece", "Collection", "HomeLayout", "Template"]),
  entityId: z.string(),
  diff: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

export type Card = z.infer<typeof CardSchema>;
export type ContentPiece = z.infer<typeof ContentPieceSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type HomeLayout = z.infer<typeof HomeLayoutSchema>;
export type User = z.infer<typeof UserSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;


