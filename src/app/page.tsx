import { getEntries } from './queries/get-entries'
import { createEntry } from './actions/create-entry'

function toKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function Page() {
  const entries = await getEntries()
  const set = new Set(entries.map((e) => toKey(e.date)))

  // last 84 days (12 weeks)
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d)
  }

  return (
    <div className="p-6 space-y-6">
      <form action={createEntry} className="space-y-3">
        <input type="date" name="date" className="border p-2" required />
        <textarea name="text" className="border p-2 w-full" required />
        <button className="bg-black text-white px-4 py-2">Save</button>
      </form>

      <div className="grid grid-cols-14 gap-2">
        {days.map((d) => {
          const has = set.has(toKey(d))
          return (
            <div
              key={toKey(d)}
              title={toKey(d)}
              className={`h-4 w-4 rounded-sm border ${
                has ? 'bg-black' : 'bg-white'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
