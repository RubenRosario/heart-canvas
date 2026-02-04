// Date helpers for consistent day boundaries and ranges.

export function toKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function rangeForLastNWeeks(n: number, today = new Date()): {
  start: Date
  end: Date
} {
  const end = endOfDay(today)
  const start = startOfDay(new Date(end))
  start.setDate(start.getDate() - (n * 7 - 1))
  return { start, end }
}

export function rangeForYear(year: number, today = new Date()): {
  start: Date
  end: Date
} {
  const start = startOfDay(new Date(year, 0, 1))
  let end = endOfDay(new Date(year, 11, 31))
  if (year === today.getFullYear()) {
    end = endOfDay(today)
  }
  return { start, end }
}
