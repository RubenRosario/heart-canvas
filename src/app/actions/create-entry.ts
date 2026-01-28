'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function createEntry(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const text = String(formData.get('text') || '')
  const date = new Date(String(formData.get('date')))

  if (!text || !date) throw new Error('Invalid input')

  // ensure local user exists (idempotent)
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId },
  })

  await prisma.entry.create({
    data: {
      userId: user.id,
      date,
      text,
    },
  })
}
