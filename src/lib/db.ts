import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

console.log("[db.ts] module loaded. Existing prisma client?", !!globalForPrisma.prisma);

try {
  const tmpDbPath = '/tmp/custom_flux.db';
  if (!fs.existsSync(tmpDbPath)) {
    console.log("[db.ts] /tmp/custom_flux.db does not exist, copying from bundled db...");
    const bundledDbPath = path.join(process.cwd(), 'prisma', 'custom_flux.db');
    if (fs.existsSync(bundledDbPath)) {
      fs.copyFileSync(bundledDbPath, tmpDbPath);
      console.log("[db.ts] Successfully copied bundled db to /tmp");
    } else {
      console.log("[db.ts] Bundled db not found at", bundledDbPath);
    }
  }
} catch (e) {
  console.error("[db.ts] Error checking/copying db:", e);
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
