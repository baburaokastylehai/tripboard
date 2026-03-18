# PRODUCT — What TripBoard Is

## One Paragraph

TripBoard is a shared trip planning board where one person creates a trip, shares a link, and everyone in the group drops their links, notes, and files in one place. Paste a booking URL and it auto-categorizes into Stay, Getting There, Things to Do, or Eat & Drink. Mark things as booked or still considering. Switch to a day view when the trip gets close. No sign-ups, no accounts, no app downloads — it works from a browser link.

## URL

**tripboard.fortheplot.today**

Routes:
- `/` — Landing page
- `/new` — Create a trip
- `/t/{slug}` — Trip board (shareable link)

## Who It's For

- **The Group Trip Organizer**: The friend who always ends up coordinating logistics. They create the board, share the link, and finally have a place to point people to instead of repeating themselves in chat.
- **The Link Dropper**: The person who finds the perfect Airbnb at 2am or the restaurant from that TikTok. They need somewhere to put it that isn't going to get buried by 47 messages about who's driving.
- **The "Just Tell Me Where to Be" Friend**: The person who doesn't want to plan but wants to see what's happening. They can browse the board without creating an account or even entering their name.
- **Friend Groups of 3-8**: Millennials (25-40) planning weekend trips, group vacations, or destination events. Too many people for a spreadsheet, too informal for an app with seat licenses.

## Core Features

| Feature | Description |
|---|---|
| **One-link sharing** | Create a trip, get a link. Anyone with the link can view and add. No auth, no accounts. |
| **Smart link paste** | Paste one or multiple URLs in the input. TripBoard auto-detects the domain and categorizes into Stay, Getting There, Things to Do, or Eat & Drink. |
| **Four category buckets** | Stay (Airbnb, hotels), Getting There (flights, ferries), Things to Do (activities, sights), Eat & Drink (restaurants, bars). |
| **Status tracking** | Each item is "considering" or "booked". Toggle with a tap. Booked items get a green left border. |
| **Day view** | When a trip has dates, switch from category view to day-by-day view. Items with dates show under their day. |
| **Manual add** | Add links, notes, or file uploads (screenshots, PDFs) to any category via a bottom sheet. |
| **Live sync** | Board polls every 10 seconds. Multiple people can add items simultaneously. Green "live" dot in header. |
| **PWA** | Installable as a home screen app on mobile. Prompts after first visit. |
| **Offline awareness** | Shows a banner when offline. Gracefully degrades — browsing works, adding doesn't. |
| **Attribution** | Every item shows "by {name}" so the group knows who added what. |
| **Feedback loop** | Built-in feedback overlay from the founder ("hey, i'm atharva") with direct-to-database submission. |

## What Makes It Different

- **No auth**: No sign-ups, no passwords, no OAuth. Open a link and you're in. Name is stored in localStorage, asked only once.
- **Auto-categorize**: Paste an Airbnb URL and it goes to Stay. Paste a Kayak URL and it goes to Getting There. Domain-based heuristic with edge function fallback.
- **Purpose-scoped**: Not a general planning tool. Not a spreadsheet. Not a shared doc. It does one thing — organize trip links for friend groups — and nothing else.
- **No lock-in**: Nothing to install, no data to migrate, no account to delete. It's a link.

## Current Limitations

- **No real-time websockets**: Uses 10-second polling, not live push. Multiple simultaneous edits can briefly show stale data.
- **No authentication**: Anyone with the link can add or delete items. No permissions, no admin role.
- **No undo on delete**: Deleting an item is permanent. Clear All has a confirmation dialog but individual deletes don't.
- **Basic categorization**: Domain-based heuristics only. A Google Maps link to a restaurant won't categorize as Food — it'll default to Things to Do.
- **No rich link previews**: Items show the domain name as title, not the page title or thumbnail.
- **Single-language**: English only.
- **No trip deletion**: Once a trip is created, there's no way to delete it from the UI.
- **localStorage identity**: User name is per-browser. Same person on two devices shows as two people.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Edge Functions + RLS)
- PostHog analytics
- PWA with service worker (vite-plugin-pwa)
- Sonner for toast notifications
- Hosted on Lovable

## Analytics Events Tracked

- `trip_created`, `item_added`, `smart_links_added`
- `share_opened`, `user_joined_trip`
- `feedback_submitted`
- `name_prompt_completed`
