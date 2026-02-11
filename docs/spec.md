# Gratitude Board — Product & Technical Specification

## 1. Purpose
A personal web application that helps users build a daily gratitude habit by visualizing entries as a calendar-style board of AI-generated images, inspired by GitHub’s contribution graph.

Each day with a gratitude entry generates a unique image that represents that day’s sentiment.

---

## 2. Core User Goals
- Record one gratitude entry per day
- See consistency over time in a visual, calendar-like format
- Instantly recognize completed, pending, or missing days
- View each day’s gratitude as an image, not just text

---

## 3. Non-Goals
- Social features (sharing, likes, comments)
- Public profiles

---

## 4. User Experience Requirements

### 4.1 Authentication
- Users **must be authenticated** to access the app
- Unauthenticated users are redirected to `/sign-in`
- Authentication handled by Clerk

### 4.2 Entry Creation
- One gratitude entry per user per calendar day
- Entry includes:
  - Date
  - Free-text gratitude description
- Default creation flow is modal-based from the board (today cell `Add` affordance)
- Duplicate entries for the same day are rejected

### 4.3 Entry Editing
- Users can update an existing gratitude entry for a day
- Existing-entry cells can open a reflection modal for editing text
- Editing an entry updates its text (and may regenerate the image)

### 4.4 Board View
- Displays a **calendar-like grid** of recent days
- Grid fills the full page width
- Board container width remains fixed; density controls do not resize the board container
- Includes Figma-style `S / M / L` density controls (changed only by minus/plus controls)
- Density controls change cells-per-row and reflow day cells across rows:
  - `S`: 28 columns
  - `M`: 14 columns
  - `L`: 7 columns
- Default density is responsive by screen size:
  - Phone: `L`
  - Tablet: `M`
  - Desktop: `S`
- Users can still manually switch between `S / M / L` on all device sizes
- Each cell:
  - Represents a single calendar day
  - Has no spacing between cells
  - Has a light gray border
  - Does not show a default day number
  - Shows a top-left date label only for the first day of each month, formatted as `MMM d` (e.g. `Feb 1`)
  - Shows an `Add` affordance on the current day when no entry exists
- Cell states:
  - Empty (no entry)
  - Pending (entry exists, image generation running)
  - Complete (image generated)
- All scaling options display the full current calendar year, including future days/months

### 4.5 Image Rendering
- When image generation completes:
  - The image fully fills the cell
  - Uses object-fit: cover
- Images are visible directly on the board (no click required)

### 4.6 Responsiveness
- The app is responsive across mobile, tablet, and desktop

---

## 5. System Architecture

### 5.1 Frontend
- Next.js (App Router)
- Server Components by default
- TailwindCSS for styling
- shadcn/ui for UI components
- `next/image` for optimized image rendering

### 5.2 Backend
- Next.js Server Actions
- Background jobs handled asynchronously

### 5.3 Authentication
- Clerk
- Clerk user ID mapped to internal `User` record

### 5.4 Database
- PostgreSQL (Neon)
- Prisma ORM

#### Core Tables
- `User`
- `Entry`
- `ImageGeneration`

---

## 6. Data Model (Logical)

### User
- `id`
- `clerkId`
- timestamps

### Entry
- `id`
- `userId`
- `date` (unique per user)
- `text`
- timestamps

### ImageGeneration
- `entryId` (1:1)
- `status` (`pending | complete | failed`)
- `prompt`
- `model`
- `imageUrl`
- timestamps

---

## 7. Background Processing

### 7.1 Triggering
- Creating an entry triggers an async background task

### 7.2 Image Generation
- Uses OpenAI Images API
- Prompt derived from entry text
- Image size: `1024x1024`

### 7.3 Storage
- Images uploaded to Vercel Blob Storage
- Database stores only the public image URL

### 7.4 Failure Handling
- Failed jobs update status to `failed`
- No retries in MVP (manual regeneration later)

---

## 8. Performance & Scalability Constraints
- No base64 images stored in the database
- All images served via CDN (Vercel Blob)
- Async jobs must not block user interaction
- Grid rendering must work with hundreds of entries

---

## 9. Security & Privacy
- All data is private per user
- Images are public URLs but unindexed
- No third-party sharing in MVP

---

## 10. Deployment
- Hosted on Vercel
- Environment variables:
  - Clerk keys
  - Neon `DATABASE_URL`
  - OpenAI API key
  - Trigger.dev secret
  - Vercel Blob credentials

---

## 11. Future Extensions (Explicitly Deferred)
- Click a day to open a detailed view
- Regenerate image
- Mood tagging
- Export/share views

---

## 12. Guiding Principles
- One feature at a time
- Async by default
- Visual first, text second
- No premature abstraction
- Storage > database for binaries
