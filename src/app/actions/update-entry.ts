'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { tasks } from '@trigger.dev/sdk/v3'

export type UpdateEntryResult =
  | { ok: true }
  | { ok: false; error: 'not_found' | 'invalid' }

/**
 * Update an existing gratitude entry and optionally re-trigger image generation.
 * @param params.entryId - Entry id to update.
 * @param params.text - Updated gratitude text.
 * @returns A result indicating success or a validation/not-found error.
 */
export async function updateEntry({
  entryId,
  text,
}: {
  entryId: string
  text: string
}): Promise<UpdateEntryResult> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const trimmedText = String(text || '').trim()
  if (!trimmedText) return { ok: false, error: 'invalid' }

  // Resolve the local user record from the Clerk user id.
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  })
  if (!user) return { ok: false, error: 'not_found' }

  // Ensure the entry belongs to the signed-in user.
  const entry = await prisma.entry.findFirst({
    where: { id: entryId, userId: user.id },
    select: { id: true },
  })
  if (!entry) return { ok: false, error: 'not_found' }

  // Update text and reset image generation so a fresh image can be created.
  await prisma.$transaction([
    prisma.entry.update({
      where: { id: entryId },
      data: { text: trimmedText },
    }),
    prisma.imageGeneration.upsert({
      where: { entryId },
      update: {
        status: 'pending',
        imageUrl: null,
        prompt: '',
        error: null,
      },
      create: {
        entryId,
        status: 'pending',
        prompt: '',
      },
    }),
  ])

  // Enqueue image generation task.
  await tasks.trigger('generate-entry-image', { entryId })

  return { ok: true }
}
