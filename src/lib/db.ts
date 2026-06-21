import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";

/**
 * Creates a PrismaClient configured for the current environment:
 * - On Vercel/production with Turso: uses the libSQL driver adapter
 *   (DATABASE_URL = libsql://..., TURSO_AUTH_TOKEN = ...)
 * - On local dev: uses a local SQLite file (file:./db/custom.db)
 */
function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "file:./db/custom.db";
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // Turso / libSQL cloud database (production)
  if (dbUrl.startsWith("libsql:") || dbUrl.startsWith("http")) {
    if (!tursoToken) {
      console.warn(
        "⚠️  DATABASE_URL is a libSQL/http URL but TURSO_AUTH_TOKEN is not set."
      );
    }
    const libsql = createClient({
      url: dbUrl,
      authToken: tursoToken,
    });
    const adapter = new PrismaLibSql(libsql);
    return new PrismaClient({
      log:
        process.env.NODE_ENV !== "production"
          ? ["query", "error", "warn"]
          : ["error"],
      adapter,
    } as any);
  }

  // Local SQLite file (development)
  let url = dbUrl;
  if (url.startsWith("file:")) {
    const filePath = url.slice("file:".length);
    const dir = dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV !== "production"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: { db: { url } },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
