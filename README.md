# Heart Atlas

Heart Atlas is a personal gratitude journal that turns daily entries into a visual “atlas” of moments. It presents a calendar-style grid of days and generates a simple abstract image for each entry, creating a timeline of gratitude you can look back on.

## Purpose
- Capture short gratitude notes by date.
- Automatically generate a visual memory for each entry.
- Browse the last 12 weeks of entries at a glance.

## How it works
- Authenticated users create dated entries.
- A background task generates an image with AI from the entry text.
- The UI renders a 12‑week grid and shows the generated images.

## Tech Stack
- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Prisma** with **PostgreSQL**
- **Clerk** for authentication
- **Trigger.dev** for background image generation tasks
- **OpenAI Images API** for image creation
- **Vercel Blob** for image storage

## Development
```bash
npm install
npm run dev
npx trigger.dev dev
