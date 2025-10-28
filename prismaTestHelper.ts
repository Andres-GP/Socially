import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export const setupDatabase = async () => {
  await prisma.$connect();
};

export const teardownDatabase = async () => {
  await prisma.$disconnect();
};
