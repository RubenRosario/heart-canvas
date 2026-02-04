# Gratitude Board - Implementation Checklist

## Prep & Alignment
- [ ] Review `docs/spec.md` for current requirements and confirm any ambiguities.
- [ ] Confirm whether editing an entry always regenerates the image or only updates text.
- [ ] Decide if "scroll to view earlier days" should be a button or infinite scroll.

## Data & Utilities
- [ ] Add date utilities in `src/lib/dates.ts`:
  - [ ] `toKey(date)`
  - [ ] `startOfDay(date)`
  - [ ] `endOfDay(date)`
  - [ ] `rangeForLastNWeeks(n, today)`
  - [ ] `rangeForYear(year, today)`
- [ ] Add `getEntriesByRange({ start, end })` query in `src/app/queries/get-entries.ts`.
- [ ] Ensure entries include `id`, `date`, `text`, and `imageGen { status, imageUrl }`.

## Server Actions
- [ ] Update `createEntry` to return a typed result:
  - [ ] Normalize date to start-of-day.
  - [ ] Handle duplicates (P2002) with a `duplicate` error.
  - [ ] Keep image generation trigger on success.
- [ ] Add `updateEntry` action:
  - [ ] Verify ownership by `userId`.
  - [ ] Update entry text.
  - [ ] Optionally reset image generation + re-trigger task.
  - [ ] Return typed result for UI handling.

## UI Foundation (shadcn/ui)
- [ ] Add `src/lib/utils.ts` with `cn()` helper.
- [ ] Add shadcn/ui components:
  - [ ] `Button`
  - [ ] `Input`
  - [ ] `Textarea`
  - [ ] `Dialog`
  - [ ] `ScrollArea`
  - [ ] `Slider`
- [ ] Add dependencies if missing: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.
- [ ] Update `src/app/globals.css` if needed for shadcn defaults.

## Component Refactor (no behavior change)
- [ ] Create `src/components/EntryForm.tsx` (client component).
- [ ] Create `src/components/Board.tsx` (server component for initial refactor).
- [ ] Create `src/components/DayCell.tsx`.
- [ ] Update `src/app/page.tsx` to use components.

## Board Behavior (4-week default)
- [ ] Switch to 4-week default range using `rangeForLastNWeeks(4)`.
- [ ] Convert grid to weeks-by-days layout (`grid-flow-col`, `grid-rows-7`).
- [ ] Add status styling:
  - [ ] Empty
  - [ ] Pending
  - [ ] Complete (image)
  - [ ] Failed
- [ ] Keep day number label (top-left, muted).

## Scroll / Range Expansion
- [ ] Convert `Board` to client component with `weeksLoaded` state.
- [ ] Add "Load earlier" control (or infinite scroll) to extend range.
- [ ] Wire data fetching to `getEntriesByRange` for expanded ranges.
- [ ] Wrap grid in `ScrollArea` for horizontal overflow.

## Zoom / Year View
- [ ] Add zoom control (`weeks` / `year`).
- [ ] Fetch full-year range when in year view.
- [ ] Adjust cell sizing for year view.

## Editing Flow
- [ ] Add edit affordance on `DayCell` for days with entries.
- [ ] Implement edit dialog with `Textarea`.
- [ ] Call `updateEntry` and refresh board on success.
- [ ] Handle error states and preserve status indicators.

## Responsiveness & UX Polish
- [ ] Ensure form + controls stack on mobile.
- [ ] Verify grid scrolls correctly on small screens.
- [ ] Ensure labels remain legible at small sizes.
- [ ] Confirm `next/image` sizing works for all breakpoints.

## Verification Checklist
- [ ] Can sign in and reach `/`.
- [ ] Can create an entry for today.
- [ ] Duplicate entry for same day is rejected.
- [ ] Pending state visible after creation.
- [ ] Completed image renders when generation finishes.
- [ ] Can edit an existing entry.
- [ ] Can load earlier days.
- [ ] Can zoom out to a full-year view.
- [ ] Layout is responsive on mobile/tablet/desktop.
