// src/prisma.ts
import { PrismaClient } from "@prisma/client";

// prevent multiple Prisma instances in dev (important for hot reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ["query", "info", "warn", "error"], // optional logging
    });

if (process.env["NODE_ENV"] !== "production") {
    globalForPrisma.prisma = prisma;
}
