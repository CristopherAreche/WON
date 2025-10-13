import { PrismaClient } from "@prisma/client";

// Evita múltiples instancias en desarrollo (HMR)
// Tipamos globalThis para no pelear con TypeScript
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Útil para depurar en dev; en prod sólo errores
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// En dev guardamos la instancia en global; en prod NO
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
