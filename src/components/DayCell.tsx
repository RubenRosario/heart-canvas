'use client'

import Image from 'next/image'
import { toKey } from '@/lib/dates'
import { cn } from '@/lib/utils'

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
 * Map image generation status to the visual treatment used by the Figma design.
 * @param status - Image generation status for the current day.
 * @returns A Tailwind class string for the cell background.
 */
function statusToClass(status: string): string {
  if (status === 'pending') {
    return 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 animate-pulse'
  }

  if (status === 'failed') {
    return 'bg-stone-100'
  }

  if (status === 'empty') {
    return 'bg-white/40'
  }

  return 'bg-white'
}

/**
 * Render one board day cell with Figma-aligned visual behavior.
 * @param props.day - Calendar day represented by the cell.
 * @param props.entry - Optional gratitude entry for that day.
 * @param props.isToday - Whether this cell is the current day.
 * @param props.topLabel - Optional top-left date label (e.g. month starts).
 * @param props.onAddEntry - Callback for opening create flow for a day.
 * @param props.onEditEntry - Callback for opening edit flow for an existing day entry.
 * @returns A day cell with image/status layers and hover affordances.
 */
export function DayCell({
  day,
  entry,
  isToday,
  topLabel,
  onAddEntry,
  onEditEntry,
}: {
  day: Date
  entry?: Entry
  isToday?: boolean
  topLabel?: string
  onAddEntry?: (date: string) => void
  onEditEntry?: (date: string) => void
}) {
  const dateKey = toKey(day)
  const status = entry?.imageGen?.status ?? (entry ? 'none' : 'empty')
  const imageUrl = entry?.imageGen?.imageUrl ?? null

  return (
    <div
      title={`${dateKey} - ${status}`}
      role={entry?.id ? 'button' : undefined}
      tabIndex={entry?.id ? 0 : -1}
      onClick={() => (entry?.id ? onEditEntry?.(dateKey) : undefined)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && entry?.id) {
          onEditEntry?.(dateKey)
        }
      }}
      className={cn(
        'group relative -mb-px -mr-px aspect-square h-full w-full overflow-hidden border border-slate-100 transition-all duration-300',
        statusToClass(status),
        entry?.id ? 'cursor-text' : undefined
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={dateKey}
          fill
          sizes="(max-width: 640px) 18vw, (max-width: 1024px) 10vw, 64px"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          priority={false}
        />
      ) : null}

      {topLabel ? (
        <div className="pointer-events-none absolute left-1 top-1 text-[10px] font-bold leading-none text-slate-600">
          {topLabel}
        </div>
      ) : null}

      {isToday && !entry ? (
        <button
          type="button"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center text-slate-500 transition-colors hover:text-slate-900"
          onClick={(event) => {
            event.stopPropagation()
            onAddEntry?.(dateKey)
          }}
          aria-label={`Add gratitude entry for ${dateKey}`}
        >
          <span className="text-[18px] leading-none">+</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Add</span>
        </button>
      ) : null}

      <div className="pointer-events-none absolute inset-0 flex items-end bg-black/0 p-1 transition-colors group-hover:bg-black/5">
        <span className="text-[8px] font-bold text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
          {day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  )
}
