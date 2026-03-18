# CHANNELS — Where and How to Post

## General Rules (All Platforms)

1. Never say "we." It's one person building this. Say "I" or just describe the thing.
2. Never use the word "excited" or "thrilled" or "proud to announce."
3. Never use hashtags unless the platform requires them for discoverability (Instagram only).
4. Never lead with features. Lead with the problem or the moment.
5. Always include the URL: `tripboard.fortheplot.today`
6. Screenshots > descriptions. Show the actual product.
7. Respond to every comment. This is early — every interaction matters.

---

## X (Twitter)

### Tone
Casual, dry, observational. Like a tweet from a friend, not a brand. Lowercase preferred. Short threads OK, but most posts should be standalone.

### Format
- One-liner observations about group trip planning
- Screenshots of the actual product
- Short "I built this" threads (3-5 tweets max)
- Quote-tweet travel memes with TripBoard context
- Reply to people complaining about group chats

### Frequency
- 3-5 tweets per week
- Don't batch-schedule. Post when something's real — a feature shipped, a user said something, a thought hit you.

### What Works
- Relatable group chat moments
- Screenshots of the product with minimal caption
- Honest "here's what I'm building" updates
- Engaging with the indie maker / build-in-public community

### What Never to Do
- Don't thread every tweet. Most should stand alone.
- Don't use "🚀 Big announcement!" energy.
- Don't tag influencers hoping for retweets.
- Don't auto-cross-post from other platforms.

### Example Post
```
every group trip has that moment where someone asks "can you resend that airbnb link" for the third time.

built a thing for that — one link, everyone drops their stuff, it sorts itself.

tripboard.fortheplot.today
```

---

## Reddit

### Tone
Helpful, honest, not promotional. Reddit hates self-promo. Frame as "I made this thing" or "here's what worked for my group." Answer questions genuinely. Never link-dump.

### Which Subs and How

| Subreddit | Framing | Approach |
|---|---|---|
| r/SideProject | "I built a shared trip board for friend groups" | Show the product, share the stack, talk about design decisions. This sub welcomes maker posts. |
| r/InternetIsBeautiful | "TripBoard — paste trip links and they auto-sort into categories" | Title must describe what it does. Comments should explain the "why." |
| r/travel | Answer existing questions about group trip planning, mention TripBoard only if directly relevant. | Never make a post just to promote. Be a helpful commenter first. Drop the link only when someone asks "how do you organize group trips?" |
| r/india | "Built a free tool for planning group trips (Goa, Himachal, etc.) — no sign-ups needed" | Lean into the India context. Mention specific trip types. Be direct about it being free and no-auth. |
| r/webdev or r/reactjs | "Show off: Trip planning PWA with React 18, Supabase, auto-categorization" | Technical angle. Talk about the stack, the no-auth decision, PWA choices. |

### Rules to Follow
- Read each sub's rules before posting. Some ban self-promotion entirely.
- Never post the same thing to multiple subs on the same day.
- Engage with comments for at least 24 hours after posting.
- If your post gets removed, don't repost. Ask the mods.
- Use the "I made this" or "Show-off Saturday" flairs where available.

### What Never to Do
- Don't use marketing language in titles.
- Don't say "check out my app" — say "I built this, here's why."
- Don't shill in comment sections of unrelated posts.
- Don't create multiple accounts to upvote yourself.

### Example Post (r/SideProject)
```
Title: I built a shared trip planning board — no sign-ups, auto-sorts links

Body:
My friend group plans 2-3 trips a year and every time the same thing
happens — someone drops an Airbnb link in the chat, 50 messages happen,
and nobody can find it later.

I built TripBoard to fix this. One person creates a trip, shares a link,
and everyone drops their bookings and finds. Paste a URL and it
auto-categorizes into Stay, Getting There, Things to Do, or Eat & Drink.

No accounts. No downloads. Just a link.

tripboard.fortheplot.today

Stack: React 18, TypeScript, Supabase, Tailwind, PWA.

Would love any feedback — it's early and I'm iterating fast.
```

---

## Hacker News

### Tone
Technical, understated, honest about trade-offs. HN respects builders who know what they built and what they didn't. Don't oversell.

### Format
- "Show HN" post with a clear, boring title
- Comment immediately with the "why" and technical context
- Be ready to discuss architectural decisions

### Technical Depth Expected
HN will ask about:
- Why no auth? (Answer: purpose-scoped — trip boards are meant to be shared, auth adds friction that kills adoption for the "passenger" user)
- Why Supabase? (Answer: Postgres + Edge Functions + RLS in one, fast to ship as a solo builder)
- Why not websockets? (Answer: 10s polling is good enough for the use case, simpler to maintain)
- Privacy of shared links? (Answer: security through obscurity via random slugs — anyone with the link can access, which is the point)

### What Never to Do
- Don't use superlatives ("the best", "revolutionary").
- Don't respond defensively to criticism.
- Don't edit the post after it's up (edit the top comment instead).
- Don't ask people to upvote.

### Example Post
```
Title: Show HN: TripBoard – Shared trip planning board, no sign-ups

URL: tripboard.fortheplot.today

---

Top comment:

Hey HN — I built TripBoard because my friend group's trip planning
always devolves into "can someone resend that link?"

It's a shared board where you paste travel URLs and they auto-categorize
(Airbnb → Stay, Kayak → Getting There, etc.). No accounts — anyone with
the link can add. Items are "considering" or "booked."

Stack: React 18/TS, Supabase (Postgres + Edge Functions), Tailwind, PWA.
Domain categorization uses heuristics on the client with an edge function
fallback for anything ambiguous.

Design decision I'm most opinionated about: no auth. The hardest person
to get on a trip planning tool is the friend who "just wants to know
where to be." Making them create an account kills it. A link is the
lowest-friction entry point.

Happy to discuss architecture, design, or the no-auth trade-offs.
```

---

## Product Hunt

### Format
- Tagline: "group chats are for banter. trip links belong here."
- Description: Keep it to 3-4 sentences. Problem, solution, how it works.
- Maker comment: Personal, honest, not salesy.

### Maker Comment Style
```
hey PH — i'm atharva. i built tripboard because my friend group's trip
planning always goes the same way: great links get dropped in the chat,
50 messages happen, and then someone asks "can you resend that airbnb link?"

tripboard gives all of that a home. one link, everyone drops their stuff,
it sorts itself. no sign-ups, no app downloads.

it's early, it's evolving, and i'd genuinely love to hear what you think.
try it with your next group trip and let me know what breaks.

tripboard.fortheplot.today
```

### What Never to Do
- Don't launch on a weekend.
- Don't ask friends to "support" on PH — ask them to genuinely try it and comment.
- Don't respond with copy-paste answers. Every reply should be personal.
- Don't spam other launches' comments to promote yours.

---

## Instagram

### Tone
Visual, relatable, casual. Screenshots of the product in use, not mockups. Story-native — most content should be Stories, not grid posts.

### Visual Content Ideas
- **Screen recordings**: Paste a link → watch it auto-sort (5-second clip)
- **Before/after**: Screenshot of chaotic group chat vs. organized TripBoard
- **"Planning our [city] trip"**: Real board with real items, blurred if needed
- **Carousel**: 3 slides — "the problem" / "the thing" / "the link"
- **Story polls**: "How do you plan group trips?" → "Group chat" / "Google Doc" / "Vibes"

### Format
- Stories: 3-5 per session, 1-2x per week
- Reels: 15-30 second product demos, travel-adjacent humor
- Grid: Minimal. Maybe 1 per month — product screenshot + one-line caption.

### What Never to Do
- Don't use stock photos.
- Don't overdesign — screenshots of the real product are the content.
- Don't use 15 hashtags. Use 3-5 relevant ones max: #grouptravel #tripplanning #traveltools
- Don't buy followers or engagement.

### Example Story Sequence
```
Slide 1: "planning goa with 6 friends"
Slide 2: [screenshot of a TripBoard with items]
Slide 3: "paste a link and it sorts itself"
Slide 4: "tripboard.fortheplot.today — no sign-ups, just a link"
```

---

## TikTok

### Tone
Quick, demo-focused, slightly self-deprecating. "I built an app because my friends can't find links in group chats."

### Content Ideas
- **"POV: you're the trip planner"** — show the group chat chaos, then TripBoard
- **Screen recording walkthroughs** — Create trip → paste links → share → done (15s)
- **Relatable skits** — "When someone asks 'can you resend that link?' for the 4th time"
- **"Things I built this week"** — indie maker format, show the product and the code
- **Travel hack format** — "Free tool for planning group trips — no app needed"

### What Never to Do
- Don't use a professional voiceover. Use your own voice or text overlays.
- Don't make it feel like an ad. It should feel like a person showing you something cool.
- Don't use trending sounds that don't fit.
- Don't post and ghost — engage with comments.

### Example Video Script
```
[Screen recording, text overlay]

Text: "my friend group plans 3 trips a year"
Text: "every time the same thing happens"
[Show group chat with links flying by]
Text: "can someone resend that airbnb link?"
[Cut to TripBoard]
Text: "so i built a thing"
[Show pasting a link, it auto-categorizes]
Text: "paste a link. it sorts itself."
Text: "tripboard.fortheplot.today"
```

---

## Cross-Platform Don'ts

| Never Do This | Why |
|---|---|
| Cross-post identical content to every platform | Each platform has its own format expectations |
| Use "🚀 Launch day!" energy | Feels manufactured. Just ship and tell people. |
| Tag/mention people who didn't ask | Spam behavior, burns bridges |
| Delete negative comments | Respond genuinely or leave them |
| Post only about TripBoard | Mix in genuine observations about travel, building, etc. |
| Use AI-generated images for social | Everything should be real product screenshots or real content |
| Promise features you haven't built | Only talk about what exists today |
