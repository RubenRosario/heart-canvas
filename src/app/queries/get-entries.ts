import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

/**
 * Fetch all entries for the signed-in user, ordered by date.
 * @returns The user's entries with image generation status.
 */
export async function getEntries() {
  const { userId } = await auth()
  if (!userId) return []

  // Resolve the local user record from the Clerk user id.
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })
  if (!user) return []

  return prisma.entry.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      date: true,
      imageGen: { select: { status: true, imageUrl: true } },
    },
    orderBy: { date: 'asc' },
  })
}

/**
 * Fetch entries for the signed-in user within a date range, ordered by date.
 * @param params.start - Inclusive start of the date range.
 * @param params.end - Inclusive end of the date range.
 * @returns The user's entries within the date range with image generation status.
 */
export async function getEntriesByRange({
  start,
  end,
}: {
  start: Date
  end: Date
}) {
  const { userId } = await auth()
  if (!userId) return []

  // Resolve the local user record from the Clerk user id.
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })
  if (!user) return []

  return prisma.entry.findMany({
    where: {
      userId: user.id,
      date: { gte: start, lte: end },
    },
    select: {
      id: true,
      date: true,
      text: true,
      imageGen: { select: { status: true, imageUrl: true } },
    },
    orderBy: { date: 'asc' },
  })
}
