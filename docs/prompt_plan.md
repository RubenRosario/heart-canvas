# Prompt Plan - Gratitude Board

## Project snapshot (existing code)
- `src/app/page.tsx`: server component that renders a simple form and a 12-week (84 day) grid using `createEntry` and `getEntries`.
- `src/app/actions/create-entry.ts`: server action that creates an entry, creates a pending `ImageGeneration`, and triggers a Trigger.dev task.
- `src/app/queries/get-entries.ts`: fetches entries for the signed-in user with date + image status.
- `prisma/schema.prisma`: `User`, `Entry` (unique per user+date), `ImageGeneration` (1:1 with entry).
- `src/trigger/generate-ai-image.ts`: Trigger.dev task that calls OpenAI Images API and updates `ImageGeneration`.
- `src/app/layout.tsx`, `src/app/globals.css`: base layout and styles.

## Spec anchors (phrases to keep in view)
- "One gratitude entry per user per calendar day"
- "Duplicate entries for the same day are rejected"
- "Users can update an existing gratitude entry for a day"
- "Default view shows the last 4 weeks"
- "Users can scroll to view earlier days"
- "Users can zoom out to view the entire year as a big picture"
- "shadcn/ui for UI components"
- "The app is responsive across mobile, tablet, and desktop"

---

## Blueprint (step-by-step)
1. Align data access with the UI needs (text + status, date range queries).
2. Improve the create flow with validation and explicit duplicate handling.
3. Add update flow for editing existing entries and optionally regenerate images.
4. Initialize shadcn/ui and use its components for all UI controls.
5. Refactor the page into focused components (EntryForm, Board, DayCell).
6. Implement the 4-week default board range and status styling.
7. Add scroll-based range expansion for older days.
8. Add zoom control to switch to a full-year view.
9. Wire edit dialog into the board and refresh UI on save.
10. Responsive polish and verification checklist.

---

## Chunking round 1 (macro chunks)
A. Data layer + server actions
B. UI foundation (shadcn + component split)
C. Board rendering (4-week default)
D. Scroll + zoom behaviors
E. Editing flow
F. Responsive polish + UX edge cases

---

## Chunking round 2 (smaller chunks)
A1. Date utilities + range query
A2. `createEntry` returns typed result + duplicate handling
A3. `updateEntry` action + optional image regen
B1. shadcn setup + core components (Button, Input, Textarea, Dialog, ScrollArea, Slider)
B2. Refactor `page.tsx` into EntryForm + Board + DayCell
C1. 4-week default range + status mapping + image rendering
C2. Error/empty states + pending/failed UI
D1. "Load earlier" range expansion
D2. Zoom toggle/slider for year view
E1. Edit dialog for existing entries
E2. Wire update action + refresh data
F1. Responsive grid and controls layout
F2. QA checklist + verify flows

---

## Final right-sized steps (validated)
1. Add date utilities and a range query for entries (include text + image status).
2. Make `createEntry` return a typed result with explicit duplicate handling.
3. Add `updateEntry` action with optional image regeneration trigger.
4. Initialize shadcn/ui and add the minimal components needed by the UI.
5. Refactor `src/app/page.tsx` into EntryForm + Board + DayCell without changing behavior.
6. Implement the 4-week default board range with correct status styling and labels.
7. Add "load earlier" range expansion and keep data in sync.
8. Add zoom control to show a full-year view and adjust cell sizes.
9. Add edit dialog for existing entries; wire update action and refresh UI.
10. Responsive polish and verification checklist.

---

# Prompts for a code-generation LLM

## Prompt 1 - Date utilities + range query
```text
You are working in the Next.js App Router project in `heart-atlas`. Follow `AGENTS.md`.

Goal: add date utilities and a range query so the UI can request entries for a date window.

Spec anchors: "Default view shows the last 4 weeks", "Users can scroll to view earlier days".

Changes:
1) Create `src/lib/dates.ts` with utilities:
   - `toKey(date)` -> YYYY-MM-DD string
   - `startOfDay(date)`
   - `endOfDay(date)`
   - `rangeForLastNWeeks(n, today)` -> { start, end }
   - `rangeForYear(year, today)` -> { start, end }
2) Update `src/app/queries/get-entries.ts`:
   - Add a new `getEntriesByRange({ start, end })` that returns entries for the signed-in user within the range.
   - Include `id`, `date`, `text`, and `imageGen { status, imageUrl }`.
   - Keep the existing `getEntries()` for now if it is used elsewhere.

Keep changes minimal and do not alter UI yet.
End by listing files changed and any assumptions.
```

## Prompt 2 - Create entry action: typed result + duplicate handling
```text
Follow `AGENTS.md`.

Goal: make `createEntry` return a typed result so the UI can show errors, and handle duplicates explicitly.

Spec anchors: "One gratitude entry per user per calendar day", "Duplicate entries for the same day are rejected".

Changes:
1) Update `src/app/actions/create-entry.ts`:
   - Normalize input date to start-of-day.
   - Return a typed result object like `{ ok: true } | { ok: false, error: 'duplicate' | 'invalid' }`.
   - Catch Prisma unique constraint errors (P2002) and return `{ ok: false, error: 'duplicate' }`.
   - Keep triggering the image generation task on success.
2) Add or export a small type for the result if helpful.

Do not change the UI yet.
End with files changed and assumptions.
```

## Prompt 3 - Update entry action (editing flow)
```text
Follow `AGENTS.md`.

Goal: add a server action to update an existing entry's text.

Spec anchors: "Users can update an existing gratitude entry for a day".

Changes:
1) Create `src/app/actions/update-entry.ts`:
   - Requires auth and verifies the entry belongs to the user.
   - Accepts `{ entryId, text }` (or `{ date, text }` if you prefer).
   - Updates the entry text.
   - Optionally set the `ImageGeneration` back to `pending`, clear `imageUrl`, and re-trigger the image task.
   - Return a typed result `{ ok: true } | { ok: false, error: 'not_found' | 'invalid' }`.
2) If you regenerate images on edit, keep behavior consistent and document it.

No UI changes yet.
End with files changed and assumptions.
```

## Prompt 4 - Initialize shadcn/ui + minimal components
```text
Follow `AGENTS.md`.

Goal: adopt shadcn/ui for the project and add the minimal component set the UI will need.

Spec anchor: "shadcn/ui for UI components".

Changes:
1) Add the shadcn utilities file `src/lib/utils.ts` with `cn()` (clsx + tailwind-merge).
2) Add minimal shadcn components in `src/components/ui/`:
   - `button.tsx`, `input.tsx`, `textarea.tsx`, `dialog.tsx`, `scroll-area.tsx`, `slider.tsx`.
3) Add required deps to `package.json` if missing: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.
4) Update `src/app/globals.css` only if necessary for shadcn defaults.

Do not refactor page UI yet.
End with files changed and assumptions.
```

## Prompt 5 - Refactor page into EntryForm + Board + DayCell (no behavior change)
```text
Follow `AGENTS.md`.

Goal: split `src/app/page.tsx` into components without changing behavior (still 84 days for now).

Spec anchor: "calendar-like grid".

Changes:
1) Create `src/components/EntryForm.tsx` (client component) using shadcn `Input`, `Textarea`, `Button`.
   - Use the existing `createEntry` server action via form `action` (no fancy state yet).
2) Create `src/components/Board.tsx` (server component) that renders the grid.
3) Create `src/components/DayCell.tsx` to render each cell and image.
4) Update `src/app/page.tsx` to use these components and keep existing behavior.

No range/zoom changes yet.
End with files changed and assumptions.
```

## Prompt 6 - Implement 4-week default range + status styling
```text
Follow `AGENTS.md`.

Goal: change the board to show the last 4 weeks by default and improve status styling.

Spec anchors: "Default view shows the last 4 weeks", "Cell states: Empty, Pending, Complete".

Changes:
1) Use `rangeForLastNWeeks(4)` from `src/lib/dates.ts` to build the days list.
2) Switch grid layout to 7 rows and N columns (weeks). Use `grid-flow-col` and `grid-rows-7`.
3) Map statuses:
   - empty -> light background
   - pending -> subtle tinted background
   - complete -> show image
   - failed -> add a subtle error tint
4) Keep the day number label top-left.

End with files changed and assumptions.
```

## Prompt 7 - Add "load earlier" range expansion
```text
Follow `AGENTS.md`.

Goal: allow users to scroll/load earlier days without jumping to a year view yet.

Spec anchor: "Users can scroll to view earlier days".

Changes:
1) Convert `Board` to a client component that keeps `weeksLoaded` state (default 4).
2) Add a "Load earlier" button (shadcn `Button`) that increments `weeksLoaded` by 4.
3) Update data fetching to use `getEntriesByRange` for the computed range.
   - You can pass initial entries from the server and refetch on expansion using a server action or route handler.
4) Wrap the grid in `ScrollArea` so horizontal scrolling is possible as the grid grows.

End with files changed and assumptions.
```

## Prompt 8 - Zoom control for full-year view
```text
Follow `AGENTS.md`.

Goal: add a zoom control that switches between 4-week view and full-year view.

Spec anchor: "Users can zoom out to view the entire year as a big picture".

Changes:
1) Add a `zoom` state (e.g., `"weeks" | "year"`) in `Board`.
2) Use shadcn `Slider` or `Button` toggle to switch modes.
3) When `zoom === "year"`, compute a full-year range and fetch entries for that range.
4) Shrink cell size in year mode (e.g., smaller `aspect-square` via CSS classes).

End with files changed and assumptions.
```

## Prompt 9 - Edit dialog for existing entries
```text
Follow `AGENTS.md`.

Goal: let users edit an existing entry text from the board and update the data.

Spec anchor: "Users can update an existing gratitude entry for a day".

Changes:
1) Add an edit affordance on `DayCell` when an entry exists (icon button on hover).
2) Use shadcn `Dialog` with a `Textarea` to edit the text.
3) Submit to `updateEntry` action and refresh the board data on success.
4) Handle error states and preserve existing statuses.

End with files changed and assumptions.
```

## Prompt 10 - Responsive polish + verification checklist
```text
Follow `AGENTS.md`.

Goal: ensure the UI is responsive and document verification steps.

Spec anchor: "The app is responsive across mobile, tablet, and desktop".

Changes:
1) Update layout classes so controls stack on mobile and the grid remains scrollable.
2) Ensure grid cells remain tappable and text remains legible at smaller sizes.
3) Add a small verification checklist to the end of the prompt response:
   - create entry
   - duplicate entry rejection
   - edit entry
   - load earlier
   - zoom year

End with files changed and assumptions.
```
