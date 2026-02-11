import { getEntriesByRange } from './queries/get-entries'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Board } from '@/components/Board'
import { rangeForLastNWeeks } from '@/lib/dates'

export default async function Page() {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const { start, end } = rangeForLastNWeeks(4, new Date())
  const entries = await getEntriesByRange({ start, end })

  return <Board entries={entries} initialEnd={end.toISOString()} />
}
