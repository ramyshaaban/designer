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

  console.log("Seeded users:", admin.email, editor.email, viewer.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


