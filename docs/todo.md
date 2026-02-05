# Gratitude Board - Implementation Checklist

## Prep & Alignment
- [ ] Review `docs/spec.md` for current requirements and confirm any ambiguities.
- [ ] Confirm whether editing an entry always regenerates the image or only updates text.
- [ ] Decide if "scroll to view earlier days" should be a button or infinite scroll.

## Data & Utilities
- [x] Add date utilities in `src/lib/dates.ts`:
  - [x] `toKey(date)`
  - [x] `startOfDay(date)`
  - [x] `endOfDay(date)`
  - [x] `rangeForLastNWeeks(n, today)`
  - [x] `rangeForYear(year, today)`
- [x] Add `getEntriesByRange({ start, end })` query in `src/app/queries/get-entries.ts`.
- [x] Ensure entries include `id`, `date`, `text`, and `imageGen { status, imageUrl }`.

## Server Actions
- [x] Update `createEntry` to return a typed result:
  - [x] Normalize date to start-of-day.
  - [x] Handle duplicates (P2002) with a `duplicate` error.
  - [x] Keep image generation trigger on success.
- [x] Add `updateEntry` action:
  - [x] Verify ownership by `userId`.
  - [x] Update entry text.
  - [x] Optionally reset image generation + re-trigger task.
  - [x] Return typed result for UI handling.

## UI Foundation (shadcn/ui)
- [x] Add shadcn/ui components:
  - [x] `Button`
  - [x] `Input`
  - [x] `Textarea`
  - [x] `Dialog`
  - [x] `ScrollArea`
  - [x] `Slider`
- [x] Add dependencies if missing: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`.
- [x] Update `src/app/globals.css` if needed for shadcn defaults.

## Component Refactor (no behavior change)
- [x] Create `src/components/EntryForm.tsx` (client component).
- [x] Create `src/components/Board.tsx` (server component for initial refactor).
- [x] Create `src/components/DayCell.tsx`.
- [x] Update `src/app/page.tsx` to use components.

## Board Behavior (4-week default)
- [x] Switch to 4-week default range using `rangeForLastNWeeks(4)`.
- [x] Convert grid to weeks-by-days layout (`grid-flow-row`, `grid-cols-7`).
- [x] Add status styling:
  - [x] Empty
  - [x] Pending
  - [x] Complete (image)
  - [x] Failed
- [x] Keep day number label (top-left, muted).

## Scroll / Range Expansion
- [x] Convert `Board` to client component with `weeksLoaded` state.
- [x] Add "Load earlier" control (or infinite scroll) to extend range.
- [x] Wire data fetching to `getEntriesByRange` for expanded ranges.
- [x] Wrap grid in `ScrollArea` for horizontal overflow.
 - [x] Compute date range on the server and pass days/entries as props to avoid hydration mismatch.

## Zoom / Year View
- [x] Add zoom control (`weeks` / `year`).
- [x] Fetch full-year range when in year view.
- [x] Adjust cell sizing for year view.

## Editing Flow
- [x] Add edit affordance on `DayCell` for days with entries.
- [x] Implement edit dialog with `Textarea`.
- [x] Call `updateEntry` and refresh board on success.
- [x] Handle error states and preserve status indicators.

## Responsiveness & UX Polish
- [x] Ensure form + controls stack on mobile.
- [x] Verify grid scrolls correctly on small screens.
- [x] Ensure labels remain legible at small sizes.
- [x] Confirm `next/image` sizing works for all breakpoints.

## Verification Checklist
- [x] Can sign in and reach `/`.
- [x] Can create an entry for today.
- [x] Duplicate entry for same day is rejected.
- [x] Pending state visible after creation.
- [x] Completed image renders when generation finishes.
- [x] Can edit an existing entry.
- [x] Can load earlier days.
- [x] Can zoom out to a full-year view.
- [ ] Layout is responsive on mobile/tablet/desktop.

## Image Quality & Full-Scale Viewer
- [ ] Ensure images render at appropriate resolution to avoid pixelation at display size.
- [ ] Add click-to-view full-scale image dialog (click image, not edit icon).
