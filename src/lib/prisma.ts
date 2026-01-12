import { PrismaClient } from '@prisma/client';

// PrismaClient es adjuntado al objeto `global` en desarrollo para prevenir
// instancias múltiples de Prisma debido a hot-reloading
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

