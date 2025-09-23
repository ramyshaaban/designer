import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hospital = await prisma.hospital.upsert({
    where: { id: "default-hospital" },
    update: {},
    create: { id: "default-hospital", name: "General Hospital" },
  });

  const [admin, editor, viewer] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@demo.test" },
      update: {},
      create: {
        name: "Admin",
        email: "admin@demo.test",
        role: Role.admin,
        hospitalId: hospital.id,
        hashedPassword: await hash("password", 10),
      },
    }),
    prisma.user.upsert({
      where: { email: "editor@demo.test" },
      update: {},
      create: {
        name: "Editor",
        email: "editor@demo.test",
        role: Role.editor,
        hospitalId: hospital.id,
        hashedPassword: await hash("password", 10),
      },
    }),
    prisma.user.upsert({
      where: { email: "viewer@demo.test" },
      update: {},
      create: {
        name: "Viewer",
        email: "viewer@demo.test",
        role: Role.viewer,
        hospitalId: hospital.id,
        hashedPassword: await hash("password", 10),
      },
    }),
  ]);

  await prisma.homeLayout.upsert({
    where: { hospitalId: hospital.id },
    update: {},
    create: {
      hospitalId: hospital.id,
      cardIds: [],
      version: 1,
    },
  });

  // Seed contents
  const contents = await prisma.$transaction([
    prisma.contentPiece.upsert({
      where: { id: "seed-orientation-videos" },
      update: {},
      create: { id: "seed-orientation-videos", title: "Orientation Overview", kind: "video", mediaUrl: "https://example.com/orientation.mp4", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-policies" },
      update: {},
      create: { id: "seed-policies", title: "Policies & Procedures", kind: "pdf", mediaUrl: "https://example.com/policies.pdf", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-call-schedule" },
      update: {},
      create: { id: "seed-call-schedule", title: "Call Schedule", kind: "link", mediaUrl: "https://intranet.example.com/call-schedule", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-faq" },
      update: {},
      create: { id: "seed-faq", title: "FAQ", kind: "article", body: "## Common Questions", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-med-admin" },
      update: {},
      create: { id: "seed-med-admin", title: "Medication Administration", kind: "video", mediaUrl: "https://example.com/med-admin.mp4", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-central-line-checklist" },
      update: {},
      create: { id: "seed-central-line-checklist", title: "Central Line Care Checklist", kind: "pdf", mediaUrl: "https://example.com/central-line.pdf", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-ce-credits" },
      update: {},
      create: { id: "seed-ce-credits", title: "CE Credits", kind: "link", mediaUrl: "https://example.com/ce", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-competency-quiz" },
      update: {},
      create: { id: "seed-competency-quiz", title: "Competency Quiz", kind: "quiz", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-acls" },
      update: {},
      create: { id: "seed-acls", title: "ACLS Algorithm", kind: "pdf", mediaUrl: "https://example.com/acls.pdf", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-antibiogram" },
      update: {},
      create: { id: "seed-antibiogram", title: "Antibiogram", kind: "pdf", mediaUrl: "https://example.com/antibiogram.pdf", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-peds-dosing" },
      update: {},
      create: { id: "seed-peds-dosing", title: "Pediatric Dosing", kind: "article", body: "Weight-based dosing tables.", createdById: admin.id },
    }),
    prisma.contentPiece.upsert({
      where: { id: "seed-equipment-setup" },
      update: {},
      create: { id: "seed-equipment-setup", title: "Equipment Setup", kind: "video", mediaUrl: "https://example.com/equipment-setup.mp4", createdById: admin.id },
    }),
  ]);

  // Seed collections
  const collections = await prisma.$transaction([
    prisma.collection.upsert({
      where: { id: "seed-orientation-videos-col" },
      update: {},
      create: { id: "seed-orientation-videos-col", title: "Orientation Videos", itemIds: ["seed-orientation-videos"] as any, createdById: admin.id },
    }),
    prisma.collection.upsert({
      where: { id: "seed-policies-col" },
      update: {},
      create: { id: "seed-policies-col", title: "Policies & Procedures", itemIds: ["seed-policies"] as any, createdById: admin.id },
    }),
    prisma.collection.upsert({
      where: { id: "seed-med-admin-col" },
      update: {},
      create: { id: "seed-med-admin-col", title: "Medication Admin Videos", itemIds: ["seed-med-admin"] as any, createdById: admin.id },
    }),
  ]);

  // Seed templates
  await prisma.$transaction([
    prisma.template.upsert({
      where: { id: "tpl-new-resident" },
      update: {},
      create: {
        id: "tpl-new-resident",
        name: "New Resident Onboarding",
        description: "Orientation videos, policies, call schedule, and FAQ",
        payload: {
          cards: [
            { id: "c1", title: "Orientation Videos", type: "collection", collectionId: "seed-orientation-videos-col", layout: { w: 2, h: 2 }, order: 1, visible: true },
            { id: "c2", title: "Policies & Procedures", type: "collection", collectionId: "seed-policies-col", layout: { w: 2, h: 2 }, order: 2, visible: true },
            { id: "c3", title: "Call Schedule", type: "content", contentId: "seed-call-schedule", layout: { w: 1, h: 1 }, order: 3, visible: true },
            { id: "c4", title: "FAQ", type: "content", contentId: "seed-faq", layout: { w: 1, h: 1 }, order: 4, visible: true },
          ],
          contents: contents.map((c) => ({ id: c.id, title: c.title, kind: c.kind, body: c.body, mediaUrl: c.mediaUrl })),
          collections: collections.map((col) => ({ id: col.id, title: col.title, description: col.description, itemIds: (col.itemIds as any) })),
        },
        tags: ["onboarding"],
      },
    }),
    prisma.template.upsert({
      where: { id: "tpl-nursing-skills" },
      update: {},
      create: {
        id: "tpl-nursing-skills",
        name: "Nursing Skills Hub",
        description: "Medication admin, checklist, CE credits, competency quizzes",
        payload: {
          cards: [
            { id: "c1", title: "Medication Admin Videos", type: "collection", collectionId: "seed-med-admin-col", layout: { w: 2, h: 2 }, order: 1, visible: true },
            { id: "c2", title: "Checklist: Central Line Care", type: "content", contentId: "seed-central-line-checklist", layout: { w: 1, h: 1 }, order: 2, visible: true },
            { id: "c3", title: "CE Credits", type: "content", contentId: "seed-ce-credits", layout: { w: 1, h: 1 }, order: 3, visible: true },
            { id: "c4", title: "Competency Quizzes", type: "content", contentId: "seed-competency-quiz", layout: { w: 1, h: 1 }, order: 4, visible: true },
          ],
          contents: contents.map((c) => ({ id: c.id, title: c.title, kind: c.kind, body: c.body, mediaUrl: c.mediaUrl })),
          collections: collections.map((col) => ({ id: col.id, title: col.title, description: col.description, itemIds: (col.itemIds as any) })),
        },
        tags: ["nursing"],
      },
    }),
    prisma.template.upsert({
      where: { id: "tpl-rapid-reference" },
      update: {},
      create: {
        id: "tpl-rapid-reference",
        name: "Rapid Reference",
        description: "Quick links: ACLS, antibiogram, pediatric dosing, equipment",
        payload: {
          cards: [
            { id: "c1", title: "ACLS Algorithm", type: "content", contentId: "seed-acls", layout: { w: 1, h: 1 }, order: 1, visible: true },
            { id: "c2", title: "Antibiogram", type: "content", contentId: "seed-antibiogram", layout: { w: 1, h: 1 }, order: 2, visible: true },
            { id: "c3", title: "Pediatric Dosing", type: "content", contentId: "seed-peds-dosing", layout: { w: 1, h: 1 }, order: 3, visible: true },
            { id: "c4", title: "Equipment Setup", type: "content", contentId: "seed-equipment-setup", layout: { w: 1, h: 1 }, order: 4, visible: true },
          ],
          contents: contents.map((c) => ({ id: c.id, title: c.title, kind: c.kind, body: c.body, mediaUrl: c.mediaUrl })),
          collections: collections.map((col) => ({ id: col.id, title: col.title, description: col.description, itemIds: (col.itemIds as any) })),
        },
        tags: ["reference"],
      },
    }),
  ]);

  console.log("Seeded users:", admin.email, editor.email, viewer.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


