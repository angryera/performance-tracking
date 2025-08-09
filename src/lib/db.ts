import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
} catch (error) {
  console.warn('Database connection failed, using mock data:', error)
  // Create a mock prisma client for development
  prisma = {
    user: {
      findUnique: async () => null,
      create: async () => ({ id: 'mock-id' }),
      update: async () => ({ id: 'mock-id' }),
      findMany: async () => []
    },
    conversation: {
      findMany: async () => [],
      create: async () => ({ id: 'mock-id' })
    },
    performance: {
      findMany: async () => []
    },
    googleSheetConfig: {
      findFirst: async () => null,
      upsert: async () => ({ id: 'mock-id' })
    }
  } as any
}

export { prisma } 