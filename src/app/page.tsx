import { getEntriesByRange } from './queries/get-entries'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Board } from '@/components/Board'
import { EntryForm } from '@/components/EntryForm'
import { rangeForLastNWeeks } from '@/lib/dates'

export default async function Page() {
  const { userId } = await auth();

  if (! userId ) redirect("/sign-in")

  const { start, end } = rangeForLastNWeeks(4, new Date())
  const entries = await getEntriesByRange({ start, end })

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <EntryForm />
      <Board entries={entries} initialEnd={end.toISOString()} />
    </div>
  )
}
