import { PrismaClient } from "@prisma/client";

if (
  process.env.NODE_ENV === "test" &&
  process.env.DATABASE_URL?.includes("neondb")
) {
  console.warn("⚠️ Running in TEST mode — connected to test database");
}

if (
  process.env.NODE_ENV !== "test" &&
  process.env.DATABASE_URL?.includes("test")
) {
  throw new Error("❌ Trying to run production code on test database!");
}

// Creamos un singleton seguro de Prisma
let prisma: PrismaClient;

export const getPrisma = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
};

export const setupDatabase = async () => {
  prisma = getPrisma();
  await prisma.$connect();
};

export const teardownDatabase = async () => {
  if (prisma) await prisma.$disconnect();
};

// Limpiar todas las tablas dependientes en orden correcto
export const resetDatabase = async () => {
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.like.deleteMany(),
    prisma.post.deleteMany(),
    prisma.follows.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};
