# tripboard

group chats are for banter. trip links belong here.

**[tripboard.fortheplot.today](https://tripboard.fortheplot.today)**

---

your group's planning a trip. the chat's flying — hotel links, restaurant recs, "has anyone booked the flights yet?" you know how it goes.

tripboard gives all of that a home. one person creates a trip, shares the link, and everyone drops their bookings, restaurant finds, and plans in one place. paste a url and it files itself — stay, getting there, things to do, eat & drink. mark what's booked, see what's still a maybe.

that's kind of it.

## how it works

1. create a trip — name it, pick an emoji
2. share the link with your crew
3. drop links, notes, or files — tripboard sorts them into the right spot

no sign-ups. no accounts. no one has to download anything. open the link and you're in.

## what's under the hood

- react 18 + typescript + vite
- supabase (postgres + edge functions + row-level security)
- tailwind css + shadcn/ui
- smart link sorting — domain lookup for ~50 travel sites, with an ai fallback for anything it doesn't recognize
- pwa — installs to your home screen
- no auth by design — the link is the access, names live in local storage

## why no auth

the hardest part of planning a trip with friends isn't the planning — it's getting everyone to actually open the thing. every login screen is a place people bail. tripboard trades accounts for zero friction. a link nobody clicks is worse than a board with no password.

## what it's not

not a spreadsheet. not a shared doc. not a general planning tool. it does one job — give your trip links a home that isn't a group chat — and doesn't try to be more than that.

## the story

after working on a handful of ideas, this is the one that got closest to something real — not the most ambitious, just the one where the problem was annoying enough and the fix simple enough that it was worth finishing. built mostly with ai tools, kept honest about what it is: small, useful, and still evolving.

the story behind this ✦ [share your thoughts](https://tripboard.fortheplot.today)

---

live at [tripboard.fortheplot.today](https://tripboard.fortheplot.today)
