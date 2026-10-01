import { PrismaClient } from "@prisma/client";

// Next dev hot-reloads modules; without the global guard each reload leaks a pool.
const g = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = g.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") g.prisma = prisma;
