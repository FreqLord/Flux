import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

console.log("[db.ts] module loaded. Existing prisma client?", !!globalForPrisma.prisma);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
