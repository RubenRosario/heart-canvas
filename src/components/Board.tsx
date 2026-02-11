'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { Minus, Plus } from 'lucide-react'
import { DayCell } from '@/components/DayCell'
import { startOfDay, toKey } from '@/lib/dates'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getEntriesByRangeAction } from '@/app/actions/get-entries-by-range'
import { createEntry } from '@/app/actions/create-entry'
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
 * Resolve the default density level from viewport width.
 * @param width - Current viewport width in pixels.
 * @returns Density level mapped to phone/tablet/desktop.
 */
function getDefaultDensityForWidth(width: number): 1 | 2 | 3 {
  if (width < 768) return 3
  if (width < 1024) return 2
  return 1
}

/**
 * Render the gratitude board using the Figma-designed layout and controls.
 * @param props.entries - Entries preloaded for the initial board range.
 * @param props.initialEnd - Server-provided range end used as hydration-safe anchor.
 * @returns The board view with density controls and reflection modal.
 */
export function Board({
  entries,
  initialEnd,
}: {
  entries: Entry[]
  initialEnd: string
}) {
  const [density, setDensity] = useState<1 | 2 | 3>(2)
  const [hasManualDensitySelection, setHasManualDensitySelection] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [loadedEntries, setLoadedEntries] = useState<Entry[]>(entries)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [modalError, setModalError] = useState<string | null>(null)
  const autoDensity = typeof window === 'undefined' ? 2 : getDefaultDensityForWidth(window.innerWidth)
  const effectiveDensity = hasManualDensitySelection ? density : autoDensity

  const anchorEnd = useMemo(() => startOfDay(new Date(initialEnd)), [initialEnd])
  const currentYear = anchorEnd.getFullYear()
  const range = useMemo(() => {
    return {
      start: startOfDay(new Date(currentYear, 0, 1)),
      end: startOfDay(new Date(currentYear, 11, 31)),
    }
  }, [currentYear])

  const refreshEntries = useCallback(async () => {
    const nextEntries = await getEntriesByRangeAction(range)
    setLoadedEntries(nextEntries)
  }, [range])

  useEffect(() => {
    startTransition(async () => {
      await refreshEntries()
    })
  }, [refreshEntries, startTransition])

  const days: Date[] = []
  for (let day = new Date(range.start); day <= range.end; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day))
  }

  const entriesByDate = useMemo(() => {
    return new Map(loadedEntries.map((entry) => [toKey(new Date(entry.date)), entry]))
  }, [loadedEntries])

  const todayKey = toKey(new Date())
  const columnsPerRow = useMemo(() => {
    if (effectiveDensity === 1) return 28
    if (effectiveDensity === 2) return 14
    return 7
  }, [effectiveDensity])

  /**
   * Open the modal to create a reflection for a specific day.
   * @param date - Target ISO date.
   * @returns Nothing.
   */
  function openCreateModal(date: string) {
    setSelectedDate(date)
    setSelectedEntryId(null)
    setNote('')
    setModalError(null)
    setIsModalOpen(true)
  }

  /**
   * Open the modal to edit an existing reflection.
   * @param date - Target ISO date.
   * @returns Nothing.
   */
  function openEditModal(date: string) {
    const entry = entriesByDate.get(date)
    if (!entry?.id) return

    setSelectedDate(date)
    setSelectedEntryId(entry.id)
    setNote(entry.text ?? '')
    setModalError(null)
    setIsModalOpen(true)
  }

  /**
   * Persist reflection text using either create or update action.
   * @returns A promise that resolves once the entry list is refreshed.
   */
  async function submitReflection(): Promise<void> {
    const trimmedNote = note.trim()
    if (!selectedDate || !trimmedNote) {
      setModalError('Please write your reflection before saving.')
      return
    }

    startTransition(async () => {
      if (selectedEntryId) {
        const result = await updateEntry({ entryId: selectedEntryId, text: trimmedNote })
        if (!result.ok) {
          setModalError('We could not save your update. Please try again.')
          return
        }
      } else {
        const formData = new FormData()
        formData.append('date', selectedDate)
        formData.append('text', trimmedNote)

        const result = await createEntry(formData)
        if (!result.ok) {
          setModalError(
            result.error === 'duplicate'
              ? 'There is already a reflection for this date.'
              : 'Please provide a valid date and reflection text.'
          )
          return
        }
      }

      await refreshEntries()
      setModalError(null)
      setIsModalOpen(false)
      setSelectedDate(null)
      setSelectedEntryId(null)
      setNote('')
    })
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] text-slate-900 selection:bg-slate-200">
      <header className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-12 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-light leading-tight tracking-tight text-slate-950">Gratitude Board</h1>
          <p className="mt-2 text-base font-medium text-slate-700">A quiet space for reflection.</p>
        </div>

        <div className="flex flex-col items-end gap-3 text-right">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-600">
            {currentYear} / Perspective
          </span>

          <div className="flex items-center">
            <div className="flex items-center rounded-full border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm">
              <button
                type="button"
                onClick={() => {
                  setHasManualDensitySelection(true)
                  setDensity((prev) => {
                    const base = hasManualDensitySelection ? prev : effectiveDensity
                    return base === 1 ? base : ((base - 1) as 1 | 2 | 3)
                  })
                }}
                disabled={effectiveDensity === 1}
                className="rounded-full p-1.5 transition-colors hover:bg-slate-100 disabled:opacity-30"
                aria-label="Decrease density"
              >
                <Minus className="h-3.5 w-3.5 text-slate-800" />
              </button>
              <span className="w-8 text-center text-[10px] font-black uppercase tracking-tighter text-slate-900">
                {effectiveDensity === 1 ? 'S' : effectiveDensity === 2 ? 'M' : 'L'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setHasManualDensitySelection(true)
                  setDensity((prev) => {
                    const base = hasManualDensitySelection ? prev : effectiveDensity
                    return base === 3 ? base : ((base + 1) as 1 | 2 | 3)
                  })
                }}
                disabled={effectiveDensity === 3}
                className="rounded-full p-1.5 transition-colors hover:bg-slate-100 disabled:opacity-30"
                aria-label="Increase density"
              >
                <Plus className="h-3.5 w-3.5 text-slate-800" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mb-12 max-w-7xl px-6">
        <ScrollArea className="w-full">
          <div
            className="grid w-full overflow-hidden rounded-lg border border-slate-200 bg-white/60 shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-all duration-500 ease-in-out"
            style={{ gridTemplateColumns: `repeat(${columnsPerRow}, minmax(0, 1fr))` }}
          >
            {days.map((day) => {
              const dayKey = toKey(day)
              const monthStartLabel = day.getDate() === 1
                ? day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                : undefined
              return (
                <DayCell
                  key={dayKey}
                  day={day}
                  entry={entriesByDate.get(dayKey)}
                  isToday={dayKey === todayKey}
                  topLabel={monthStartLabel}
                  onAddEntry={openCreateModal}
                  onEditEntry={openEditModal}
                />
              )
            })}
          </div>
        </ScrollArea>
      </main>

      <footer className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-sm font-semibold italic text-slate-600">&quot;Gratitude turns what we have into enough.&quot;</p>
      </footer>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-none bg-white/98 shadow-2xl backdrop-blur-xl sm:max-w-[425px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-light text-slate-950">Today&apos;s Reflection</DialogTitle>
            <DialogDescription className="text-base font-semibold text-slate-800">
              What brought a quiet smile to your face today?
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <Textarea
              placeholder="Start writing..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-[160px] resize-none border-slate-200 bg-slate-50/50 text-lg font-medium leading-relaxed text-slate-950 placeholder:text-slate-500 focus-visible:ring-slate-400"
            />
            {modalError ? <p className="pt-3 text-sm text-red-600">{modalError}</p> : null}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={submitReflection}
              disabled={!note.trim() || isPending}
              className="h-auto rounded-full bg-slate-950 px-10 py-7 text-base font-bold tracking-tight text-white transition-all hover:bg-slate-800 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            >
              Save Reflection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
