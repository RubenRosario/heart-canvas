'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { tasks } from "@trigger.dev/sdk/v3";
import { startOfDay } from '@/lib/dates'
import { Prisma } from '@/generated/prisma'

export type CreateEntryResult =
  | { ok: true }
  | { ok: false; error: 'duplicate' | 'invalid' }

/**
 * Create a gratitude entry for the signed-in user and trigger image generation.
 * @param formData - Form payload containing date and text fields.
 * @returns A result indicating success or a validation/duplicate error.
 */
export async function createEntry(formData: FormData): Promise<CreateEntryResult> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const text = String(formData.get('text') || '')
  const rawDate = new Date(String(formData.get('date')))
  const date = startOfDay(rawDate)

  if (!text || Number.isNaN(date.getTime())) return { ok: false, error: 'invalid' }

  // Ensure local user exists (idempotent).
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId },
  })

  try {
    const entry = await prisma.entry.create({
      data: {
        userId: user.id,
        date,
        text,
        imageGen: {
          create: {
            status: "pending",
            prompt: "", // placeholder for now
          },
        },
      }
    })

    // Enqueue image generation task.
    await tasks.trigger("generate-entry-image", { entryId: entry.id });
  } catch (error) {
    // P2002 = unique constraint failed (duplicate entry for a user+date).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { ok: false, error: 'duplicate' }
    }
    throw error
  }

  return { ok: true }
}
