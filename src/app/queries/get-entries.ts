import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function getEntries() {
  const { userId } = await auth()
  if (!userId) return []

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })
  if (!user) return []

  return prisma.entry.findMany({
    where: { userId: user.id },
    select: { id: true, date: true },
    orderBy: { date: 'asc' },
  })
}
