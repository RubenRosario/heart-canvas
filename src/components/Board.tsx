'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { DayCell } from '@/components/DayCell'
import { rangeForYear, startOfDay, toKey } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getEntriesByRangeAction } from '@/app/actions/get-entries-by-range'

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
 * Render the board grid for the last N weeks and allow loading earlier weeks.
 * @param props - Entry data and initial range for the signed-in user.
 * @returns A calendar-like grid of day cells.
 */
export function Board({
  entries,
  initialEnd,
}: {
  entries: Entry[]
  initialEnd: string
}) {
  const [zoom, setZoom] = useState<'weeks' | 'year'>('weeks')
  const [weeksLoaded, setWeeksLoaded] = useState(4)
  const [isPending, startTransition] = useTransition()
  const [loadedEntries, setLoadedEntries] = useState<Entry[]>(entries)

  // Anchor the date range to the server-provided end date to avoid hydration mismatch.
  const anchorEnd = useMemo(() => startOfDay(new Date(initialEnd)), [initialEnd])
  const range = useMemo(() => {
    if (zoom === 'year') {
      return rangeForYear(anchorEnd.getFullYear(), anchorEnd)
    }
    const end = new Date(anchorEnd)
    const start = startOfDay(new Date(end))
    start.setDate(start.getDate() - (weeksLoaded * 7 - 1))
    return { start, end }
  }, [anchorEnd, weeksLoaded, zoom])

  // Fetch entries when the visible range expands.
  // Refresh entries when the visible date range changes or after an edit.
  const refreshEntries = useCallback(async () => {
    const nextEntries = await getEntriesByRangeAction(range)
    setLoadedEntries(nextEntries)
  }, [range])

  useEffect(() => {
    startTransition(async () => {
      await refreshEntries()
    })
  }, [refreshEntries, startTransition])

  // Build the visible days from the computed range.
  const days: Date[] = []
  for (let day = new Date(range.start); day <= range.end; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day))
  }

  // Index entries by date to avoid repeated searches.
  const entriesByDate = new Map(
    loadedEntries.map((entry) => [toKey(new Date(entry.date)), entry])
  )

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => setWeeksLoaded((prev) => prev + 4)}
          disabled={zoom === 'year' || isPending}
          className="w-full sm:w-auto"
        >
          Load earlier
        </Button>

        <div className="flex w-full items-center gap-2 text-sm text-muted-foreground sm:w-auto">
          <Button
            type="button"
            variant={zoom === 'weeks' ? 'default' : 'outline'}
            onClick={() => setZoom('weeks')}
            className="w-full sm:w-auto"
          >
            Weeks
          </Button>
          <Button
            type="button"
            variant={zoom === 'year' ? 'default' : 'outline'}
            onClick={() => setZoom('year')}
            className="w-full sm:w-auto"
          >
            Year
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="grid w-full min-w-max grid-flow-col grid-rows-7 gap-0">
          {days.map((day) => {
            const entry = entriesByDate.get(toKey(day))
            return (
              <DayCell
                key={toKey(day)}
                day={day}
                entry={entry}
                sizeClass={zoom === 'year' ? 'w-3' : undefined}
                onUpdated={refreshEntries}
              />
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
