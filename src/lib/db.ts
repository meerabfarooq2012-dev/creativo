import { PrismaClient } from '@prisma/client'
import { existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'

/**
 * Resolve the database file path.
 *
 * On Vercel/serverless, the filesystem is read-only EXCEPT for /tmp.
 * So if DATABASE_URL points to a relative file path (e.g. file:./db/custom.db),
 * we redirect it to /tmp so Prisma can write to it.
 *
 * On local dev (sandbox), we keep the original path.
 */
function resolveDatabaseUrl() {
  let url = process.env.DATABASE_URL || 'file:./db/custom.db'

  // Only rewrite file: URLs on Vercel (production) where FS is read-only
  if (process.env.VERCEL && url.startsWith('file:')) {
    const filePath = url.slice('file:'.length)
    const fileName = filePath.split('/').pop() || 'custom.db'
    // Use /tmp which is writable on Vercel serverless
    const tmpPath = join('/tmp', fileName)
    url = `file:${tmpPath}`
    // Ensure the directory exists
    const dir = dirname(tmpPath)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  }

  return url
}

const databaseUrl = resolveDatabaseUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  __dbUrl?: string
}

// If the DB URL changed (e.g. between invocations) or no client exists, create one
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['query', 'error', 'warn'] : ['error'],
    datasources: { db: { url: databaseUrl } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db