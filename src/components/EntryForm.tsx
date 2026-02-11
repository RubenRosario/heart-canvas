'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createEntry } from '@/app/actions/create-entry'

/**
 * Render the entry form for creating a gratitude entry.
 * @returns A client component form wired to the createEntry action.
 */
export function EntryForm() {
  /**
   * Submit entry data to the server action with a void-compatible signature.
   * @param formData - Form payload for entry creation.
   * @returns A promise that resolves when submission completes.
   */
  async function submitEntry(formData: FormData): Promise<void> {
    await createEntry(formData)
  }

  return (
    <form action={submitEntry} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <Input type="date" name="date" required className="w-full" />
        <Textarea name="text" required className="min-h-[96px]" />
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto">Save</Button>
      </div>
    </form>
  )
}
