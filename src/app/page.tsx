import { getEntries } from './queries/get-entries'
import { createEntry } from './actions/create-entry'
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";


// Convert a Date to a YYYY-MM-DD key for grouping/comparison.
function toKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function Page() {
  const { userId } = await auth();

  if (! userId ) redirect("/sign-in")

  const entries = await getEntries()

  // last 84 days (12 weeks)
  const days: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 83; i >= 0; i--) {
    const day = new Date(today)
    day.setDate(today.getDate() - i)
    days.push(day)
  }


  return (
    <div className="p-6 space-y-6">
      <form action={createEntry} className="space-y-3">
        <input type="date" name="date" className="border p-2" required />
        <textarea name="text" className="border p-2 w-full" required />
        <button className="bg-black text-white px-4 py-2">Save</button>
      </form>

      <div className="w-full">
        <div className="grid w-full grid-cols-14 gap-0">
          {days.map((day) => {
            const entry = entries.find((e) => toKey(e.date) === toKey(day))
            const imageUrl = entry?.imageGen?.imageUrl
            const status = entry?.imageGen?.status ?? (entry ? "none" : "empty")

            const dayNum = day.getDate() // calendar-like label (1–31)

            return (
              <div
                key={toKey(day)}
                title={`${toKey(day)} - ${status}`}
                className="relative aspect-square w-full overflow-hidden border border-gray-200"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={toKey(day)}
                    fill
                    sizes="(max-width: 768px) 7vw, 4vw"
                    className="object-cover"
                    priority={false}
                  />
                ) : (
                  <div className="h-full w-full bg-white" />
                )}

                <div className="pointer-events-none absolute left-1 top-1 text-[10px] leading-none text-gray-500">
                  {dayNum}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
