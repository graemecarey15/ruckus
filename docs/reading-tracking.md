# Reading Tracking & Dates

## How Books Are Tracked

Every book in a user's library lives in `user_books` with a status:
- `want_to_read` — on TBR list, can have custom categories
- `currently_reading` — actively reading, has progress tracking
- `finished` — done, can have a rating

## Date Fields

| Field | When it's set |
|-------|--------------|
| `created_at` | Auto-set by Supabase when the book is added to library |
| `started_at` | Set when status becomes `currently_reading` (either on initial add or status change) |
| `finished_at` | Set when status becomes `finished` |
| `updated_at` | Auto-updated on any change |

### Re-starting a book
If someone sets a book back to `want_to_read` and then to `currently_reading` again, `started_at` gets **overwritten** with the new date. This is intentional — if they put it down, they put it down.

## Where Status Changes Happen

- **`addBookToLibrary()`** — sets `started_at` if added directly as `currently_reading`
- **`updateReadingStatus()`** — sets `started_at` or `finished_at` based on the new status

Both are in `src/api/userBooks.ts`.

## Planned: Calendar View

A calendar/timeline view where users can see their reading activity throughout the year.

### Toggle modes:
1. **Start dates only** — dots/markers showing when books were started
2. **Finish dates only** — dots/markers showing when books were finished
3. **Trails** — bars showing the full start-to-finish duration for each book (how long it took to read)

### Data needed:
- Query `user_books` where `started_at` and/or `finished_at` fall within the selected year
- Trail view requires both `started_at` AND `finished_at` on the same book
- Could group by month or show a continuous timeline
