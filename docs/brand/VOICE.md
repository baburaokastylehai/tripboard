# VOICE — How TripBoard Talks

## The Rules

1. **Lowercase everything.** Headlines, buttons, empty states, toasts — all lowercase unless it's a proper noun or the start of a sentence in a paragraph block. Even then, lean lowercase.
2. **Short sentences.** If a sentence has a comma, consider splitting it. If it doesn't need a verb, drop the verb.
3. **Periods over exclamation marks.** Almost never use `!`. The one exception is the WelcomePopup ("Welcome to {tripName}!") and that's legacy.
4. **Em dashes over colons.** Use ` — ` to connect related thoughts. Never use semicolons.
5. **Second person.** Talk to "you" and "your friends." Never say "users" or "customers."
6. **Present tense.** "it files itself" not "it will file itself."
7. **Contractions always.** "it's" not "it is." "you're" not "you are." "couldn't" not "could not."
8. **No jargon.** Never say "auto-categorize" or "real-time sync" in user-facing copy. Say "it files itself" or "it updates live."
9. **Warm, not cute.** Don't try to be funny. Don't use puns. The humor comes from recognition — "you know how it goes" — not from jokes.
10. **The ✦ symbol.** Used sparingly as TripBoard's signature mark. Appears in: "add ✦", "send ✦", "thank you. this means a lot. ✦", "the story behind this ✦ share your thoughts". Never more than once per screen.

## Two Voices

### App Voice (inside the product)
Warm, quiet, confident. Like a friend who built something and doesn't need to sell you on it. Talks in lowercase. Doesn't over-explain. Trusts you to figure it out.

### Launch Voice (external — social, landing, marketing)
Honest, direct, relatable. Acknowledges the problem without being dramatic about it. Never says "revolutionary" or "game-changing." Says things like "you know how it goes" and "that's kind of it."

## Real Copy From the Codebase

### Headlines & Taglines
- `group chats are for banter. trip links belong here.` — Landing page subtitle
- `here's the idea.` — How It Works overlay title
- `that's kind of it.` — How It Works closing line
- `hey, i'm atharva.` — Feedback overlay intro
- `Set up your trip. Share the link. Everyone's in.` — Create Trip subtitle
- `Plan trips together with one link.` — Meta description (partial)

### How It Works (full text)
- `your group's planning a trip. the chat's flying - hotel links, restaurant recs, 'has anyone booked the flights yet?' you know how it goes.`
- `tripboard gives all of that a home. one link, one board. drop a url and it files itself - stay, food, things to do.`
- `mark what's booked, see what's still a maybe. when the trip gets close, switch to the day view and everything's there.`

### Feedback Overlay
- `tripboard is an experiment in making trip planning less scattered for friend groups. one person creates a trip, shares the link, and everyone drops their bookings, restaurant finds, and plans in one place - so nothing gets lost in the chat.`
- `it's early, it's evolving, and your perspective matters. if something felt off, or felt great, or you have an idea - i'd genuinely love to hear it.`
- `whatever's on your mind...` — textarea placeholder
- `email (only if you want me to reply)` — email field placeholder
- `thank you. this means a lot. ✦` — post-submit confirmation

### Buttons & Actions
- `Create a Trip` — Landing CTA
- `Create Trip` / `Creating...` — Create page submit
- `how it works →` — Landing secondary link
- `share →` / `copied ✓` — Header share pill
- `add ✦` / `sorting...` — Smart link submit
- `send ✦` — Feedback submit
- `let's go` — Name prompt + welcome popup submit
- `got it` — Install instructions dismiss
- `show me` — Install prompt CTA
- `← Back` — Navigation back buttons

### Placeholders
- `paste a link - or a few, we'll sort them out` — Smart link input
- `your name` — Name fields
- `Catalina Weekend` — Trip name field
- `March 2026 · 5 friends` — Trip subtitle field
- `paste your link` — Add item link field
- `give it a name (optional)` — Add item title field
- `Add details, confirmations, notes...` — Note textarea
- `hey, what should we call you?` — NamePromptSheet heading

### Empty States (category personality lines, randomized)
**Stay:**
- `done scrolling through endless airbnb listings? the good ones go here.`
- `that dreamy villa your friend found at 2am? save it before the chat buries it.`
- `hotels, vrbo, hostels, that one friend's cousin's guesthouse — all welcome.`

**Getting There:**
- `flights, ferries, and the 'who's driving?' conversation — sorted here.`
- `the booking confirmation someone sent last tuesday? yeah, put it here.`
- `trains, planes, and that one friend who insists on driving.`

**Things to Do:**
- `scuba, sunset hikes, or 'let's just wing it' — whatever your group's vibe is.`
- `that activity link someone dropped at 11pm? rescue it from the chat.`
- `museums and hammock people can coexist. add both.`

**Eat & Drink:**
- `the restaurant your foodie friend won't shut up about? immortalize it here.`
- `reservations, yelp links, and that tiktok ramen place — all of it.`
- `because 'where should we eat?' shouldn't take 45 minutes every night.`

### Status & System
- `considering` / `booked` — Item statuses
- `live` / `offline` — Connection indicator
- `you're offline — things might be stale` — Offline banner
- `you're offline right now — try again in a bit` — Add item offline message
- `couldn't find any links — try pasting a URL` — Smart link error
- `something went wrong — try adding manually` — Smart link insert error
- `{N} links detected` — Multi-link count
- `✦ {N} links sorted — {details}` — Batch add toast
- `{emoji} added to {category}` — Single add toast

### Sharing
- `Share this trip` — Share sheet heading
- `Anyone with this link can add and see everything.` — Share sheet disclaimer
- `trip created! share this link with your crew so everyone can add their stuff.` — Post-create share prompt
- `share the link →` — Share prompt CTA
- `Join our trip on TripBoard` — Native share text

### Other
- `Add to {category}` — Add item sheet heading
- `{N} items saved` — Trip board stats
- `{N} · {booked} booked` — Category count with booked
- `by {name}` — Item attribution
- `clear all items from this trip? this can't be undone.` — Clear confirm
- `so your friends know who added what` — Name prompt subtitle
- `add tripboard to your home screen for the full experience` — Install prompt
- `Trip not found` — 404 heading
- `Check your link and try again.` — 404 subtitle
- `the story behind this ✦ share your thoughts` — Footer/feedback link
- `· {N} trips created across tripboard ·` — Landing page counter

### Micro-interactions
- `when?` — Date field label in add item sheet
- `Tap to upload screenshot or file` — File upload CTA
- `Add item` — Empty category add button
- `Expand all` / `Collapse all` — Toggle all categories
- `By Category` / `By Day` — View mode toggle

## Words We Use

| Word | Why |
|---|---|
| trip | not "journey" or "vacation" or "itinerary" |
| board | not "dashboard" or "workspace" or "project" |
| link | not "URL" or "resource" or "bookmark" |
| drop | "drop a url" — casual, effortless |
| crew | "share with your crew" — not "team" or "group" |
| stuff | "everyone can add their stuff" — intentionally vague and casual |
| considering | not "maybe" or "interested" or "wishlist" |
| booked | not "confirmed" or "locked in" or "finalized" |
| sorted | "we'll sort them out" — not "organized" or "categorized" |
| banter | "group chats are for banter" — the word that sets the tone |

## Words We Never Use

| Never Say | Why |
|---|---|
| users | say "you" or "your friends" or "people" |
| onboarding | internal concept, never user-facing |
| workflow | corporate speak |
| collaborate | feels like a SaaS pitch |
| seamless | meaningless marketing word |
| revolutionize | we're not revolutionizing anything |
| leverage | corporate jargon |
| robust | enterprise speak |
| streamline | same |
| curate | pretentious |
| optimize | we're not optimizing, we're organizing |
| platform | it's a board, not a platform |
| sync | say "updates live" or "everyone sees the same thing" |
| real-time | say "live" |
| notification | just say "message" or "update" |
| feature | say what the thing does, not that it's a "feature" |
