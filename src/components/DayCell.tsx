'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Pencil } from 'lucide-react'
import { toKey } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { updateEntry } from '@/app/actions/update-entry'

type ImageGen = {
  status: string | null
  imageUrl: string | null
}

type Entry = {
  id: string
  date: Date | string
  text?: string | null
  imageGen?: ImageGen | null
}

/**
 * Render a single day cell for the board grid.
 * @param props - Day metadata and optional entry data.
 * @returns A board cell with status label and image content.
 */
export function DayCell({
  day,
  entry,
  sizeClass,
  onUpdated,
}: {
  day: Date
  entry?: Entry
  sizeClass?: string
  onUpdated?: () => Promise<void>
}) {
  const imageUrl = entry?.imageGen?.imageUrl ?? null
  const status = entry?.imageGen?.status ?? (entry ? 'none' : 'empty')
  const dayNum = day.getDate()
  // Map statuses to subtle background tints for empty/pending/failed states.
  const statusClass = status === 'pending'
    ? 'bg-yellow-50'
    : status === 'failed'
      ? 'bg-red-50'
      : 'bg-white'
  const [text, setText] = useState(entry?.text ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  /**
   * Submit the updated entry text and refresh the board data.
   * @returns A promise that resolves after the update attempt.
   */
  function handleSave() {
    if (!entry?.id) return

    startTransition(async () => {
      const result = await updateEntry({ entryId: entry.id, text })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setError(null)
      if (onUpdated) await onUpdated()
    })
  }

  return (
    <div
      title={`${toKey(day)} - ${status}`}
      className={cn(
        'group relative aspect-square w-full overflow-hidden border border-gray-200',
        sizeClass,
        statusClass
      )}
    >
      {imageUrl ? (
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={`View image for ${toKey(day)}`}
              className="absolute inset-0 cursor-zoom-in"
            >
              <Image
                src={imageUrl}
                alt={toKey(day)}
                fill
                sizes="(max-width: 640px) 14vw, (max-width: 1024px) 6vw, 4vw"
                className="object-cover"
                priority={false}
              />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{toKey(day)}</DialogTitle>
              <DialogDescription>Full-scale image</DialogDescription>
            </DialogHeader>
            <Image
              src={imageUrl}
              alt={toKey(day)}
              width={1024}
              height={1024}
              className="h-auto w-full"
            />
          </DialogContent>
        </Dialog>
      ) : (
        <div className={cn('h-full w-full', statusClass)} />
      )}

      <div className="pointer-events-none absolute left-1 top-1 text-[10px] leading-none text-gray-500">
        {dayNum}
      </div>

      {entry?.id ? (
        <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Edit entry">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit entry</DialogTitle>
                <DialogDescription>
                  Update your gratitude text for {toKey(day)}.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
              {error ? (
                <p className="text-sm text-red-600">Update failed: {error}</p>
              ) : null}
              <DialogFooter>
                <Button type="button" onClick={handleSave} disabled={isPending}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : null}
    </div>
  )
}
