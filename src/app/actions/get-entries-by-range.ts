'use server'

import { getEntriesByRange } from '@/app/queries/get-entries'

/**
 * Fetch entries for the signed-in user within a date range.
 * @param params.start - Inclusive start of the date range.
 * @param params.end - Inclusive end of the date range.
 * @returns Entries in the range with image generation status.
 */
export async function getEntriesByRangeAction({
  start,
  end,
}: {
  start: Date
  end: Date
}) {
  return getEntriesByRange({ start, end })
}
