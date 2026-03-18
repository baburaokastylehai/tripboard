# DESIGN — How TripBoard Looks

## Aesthetic Philosophy

TripBoard looks like a boutique hotel lobby, not a SaaS dashboard. Warm cream backgrounds, navy text, copper accents. Everything has generous padding and rounded corners. No hard edges, no bright whites, no neon colors. The design should feel like opening a well-made travel journal — quiet, tactile, and considered. It's mobile-first (max-width 480px) and treats the phone as a physical object with safe areas, bottom sheets, and touch-scale feedback.

## Color Palette

### Core Colors

| Name | Hex | Usage |
|---|---|---|
| **Cream** | `#faf7f2` | Page background, button text on navy, input backgrounds |
| **Navy** | `#1a3647` | Primary text, headings, primary buttons, header gradient start, feedback overlay bg |
| **Navy Light** | `#24495e` | Header gradient end |
| **Copper** | `#c17c4e` | Accent color, secondary CTAs, links, "add ✦" button, smart link border |
| **Text Secondary** | `#4a6572` | Body text in overlays, share prompt text |
| **Text Muted** | `#9aacb5` | Placeholder text, meta labels, timestamps, offline text |
| **Success Green** | `#5cbf8a` | Booked status, live indicator dot, trip counter text |
| **Error Red** | `#e57373` | Error messages, destructive confirm button text |
| **Disabled** | `#d0d5d8` | Disabled button backgrounds |

### Opacity Patterns

| Pattern | Value | Usage |
|---|---|---|
| Card border | `rgba(26,54,71,0.06)` | Card outlines, subtle separators |
| Card shadow | `rgba(26,54,71,0.07)` | Subtle card elevation |
| Input border | `rgba(26,54,71,0.12)` | Form field borders (default state) |
| Dashed border | `rgba(26,54,71,0.1)` | Add-item dashed borders, type selector borders |
| Header text dim | `rgba(255,255,255,0.45)` | Date range, subtitle in header |
| Header text faint | `rgba(255,255,255,0.5)` | Back arrow, edit icon in header |
| Overlay backdrop | `rgba(26,54,71,0.3)` | All modal/sheet backdrops with `blur(4px)` |
| Copper accent bg | `rgba(193,124,78,0.3)` | Smart link input left border |

## Typography

### Font Families
- **Display**: `Playfair Display`, serif — Bold (700) and ExtraBold (800). Used for headings, trip names, section titles.
- **Body**: `DM Sans`, sans-serif — Regular (400), Medium (500), SemiBold (600), Bold (700). Used for everything else.

### Font Size Scale (from codebase)

| Size | Usage |
|---|---|
| `60px` | Landing page emoji |
| `48px` | Welcome popup emoji, emoji picker display |
| `34px` | Landing page "TripBoard" heading, trip name in header |
| `28px` | Create Trip heading |
| `24px` | Category emoji, feedback overlay ✦ |
| `22px` | Sheet headings (Share, Add, Edit), welcome popup heading |
| `18px` | Category section name, close button × |
| `16px` | Primary button text, form inputs, name prompt heading |
| `15px` | Body text, textarea inputs, landing subtitle |
| `14px` | Secondary body text, stats, meta info, form labels |
| `13px` | Tertiary text, pill buttons (share, back), item titles, date labels |
| `12px` | Category counts, date range eyebrow, install prompt, offline banner |
| `11px` | Footer links, trip counter, link detected count, item attribution |
| `10px` | Item date, item status toggle, footer attribution |

### Text Styling Patterns
- Headings: `font-display font-bold` or `font-extrabold`
- Body: `font-body font-medium` or `font-semibold`
- Muted labels: `font-body text-text-muted`
- Uppercase eyebrow: `font-body text-[12px] font-medium uppercase` with `letterSpacing: '2.5px'`

## Spacing & Layout

### App Container
- Max width: `480px`, centered with `mx-auto`
- Page padding: `px-5` (20px horizontal)
- Bottom safe area: `paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 40px)'`
- Top safe area: `paddingTop: 'calc(env(safe-area-inset-top, 0px) + ...)'`

### Vertical Rhythm
- Section gaps: `48px` (mt-12) between major landing page sections
- Card gaps: `12px` between category sections
- Card list gaps: `10px` (gap-2.5) between trip cards
- Form field gaps: `12px` (gap-3) between inputs
- Sheet internal: `24px` padding, `20px` bottom padding + safe area

### Common Spacing Values
- Card padding: `12px 16px` (trip cards), `14px` (item cards), `16px` (smart link input)
- Button padding: `py-4` (16px) for primary buttons, `8px 16px` for pill buttons
- Sheet header gap: `mb-5` (20px) after grab handle
- Margin between elements: `mt-1` to `mt-5` depending on visual weight

## Border Radius

| Context | Value |
|---|---|
| Base CSS variable | `14px` (--radius) |
| Primary buttons | `14px` (rounded-[14px]) |
| Cards (trip, item, category) | `14px`-`16px` |
| Bottom sheets | `24px 24px 0 0` |
| Input fields | `12px` (rounded-xl) |
| Pill buttons (share, pill CTAs) | `20px` |
| Grab handle | `2px` |
| Welcome/confirm dialogs | `20px`-`24px` |
| Header section | `0 0 28px 28px` |

## Shadows

| Level | Value | Usage |
|---|---|---|
| Subtle | `0 1px 4px rgba(26,54,71,0.07)` | Cards (trip, item, category) |
| Light | `0 1px 6px rgba(26,54,71,0.08)` | Install prompt |
| Medium | `0 2px 8px rgba(26,54,71,0.06)` | Smart link input, share prompt |
| Elevated | `0 8px 30px rgba(26,54,71,0.12)` | Welcome popup, confirm dialog |

## Component Patterns

### Bottom Sheets
- Slide up from bottom with spring animation (0.35s, overshoot -3px)
- Grab handle: `40px wide, 4px tall, #ccc, centered`
- Background: cream `#faf7f2`
- Backdrop: navy 30% opacity + 4px blur
- Close by tapping backdrop
- Max width: 480px

### Full-Screen Overlays (Feedback, How It Works)
- Navy background `#1a3647`, full screen
- Fade in/out animation (0.4s)
- Close button: × in top-right, white at 30% opacity
- Content: centered, max-width 360px
- Copper ✦ at top as brand mark

### Cards (Item Cards)
- 148px × 148px fixed size, horizontal scroll
- White background, 1px border, subtle shadow
- Booked state: green 3px left border
- Title: 13px semibold, 2-line clamp
- Meta: 10-11px, muted color
- Status toggle at bottom: copper for considering, green for booked

### Category Sections
- Collapsible accordion pattern
- Header: white card with emoji, name, count, chevron
- Body: semi-transparent white (50% opacity), items in horizontal scroll
- Empty state: italic personality line, centered, muted color

### Pill Buttons
- Border-radius: 20px
- Padding: 8px 14-16px
- Share pill: white text on white 15% opacity bg
- Accent pills: copper text on copper 12% opacity bg

### Form Inputs
- Border: 1.5px solid rgba(26,54,71,0.12)
- Focus border: copper #c17c4e
- Background: white #fff
- Padding: 14px horizontal, 14px vertical
- Border-radius: 12px
- Placeholder: text-muted color

### Primary Buttons
- Full width, 16px padding vertical
- Active: navy bg + cream text
- Disabled: #d0d5d8 bg + white text
- Border-radius: 14px
- Font: body 16px semibold
- Feedback: scale(0.97) on tap

### Toasts (Sonner)
- Position: top-center
- Font: DM Sans 14px
- Border-radius: 12px
- Used for smart link success and clipboard fallback

## Animations

| Name | Duration | Easing | Behavior |
|---|---|---|---|
| `fadeSlideIn` | 0.3s | ease | Opacity 0→1, translateY 8px→0. Used for cards appearing. |
| `slideUpSpring` | 0.35s | cubic-bezier(0.22,1,0.36,1) | Sheet slides up with subtle -3px overshoot at 70%. |
| `fadeIn` / `fadeOut` | 0.3s | ease | Simple opacity transitions for overlays. |
| `feedbackFadeIn/Out` | 0.4s | ease | Slightly slower fade for full-screen overlays. |
| `gentleFloat` | 3s | ease-in-out, infinite | Landing emoji floats up -4px and back. |
| `liveBreathe` | 3s | ease-in-out, infinite | Live dot pulses opacity 1→0.5→1. |
| `sparklePulse` | 2s | ease-in-out, 3x | ✦ scales 1→1.3 with copper glow shadow. New user attention. |
| `pageFadeIn` | 0.2s | ease | Quick fade on page transitions. |
| `tap-scale` | 0.1s | ease | All tappable elements scale to 0.97 on :active. |

## Key Screens

### 1. Landing Page
- Cream background, centered content
- Floating 🗺 emoji (60px, gentleFloat animation)
- "TripBoard" in Playfair Display 34px extrabold
- Subtitle in DM Sans 15px muted
- Full-width navy "Create a Trip" button
- "how it works →" copper link below
- "Your Trips" section (if trips exist) with scrollable trip cards
- Green trip counter at bottom
- Footer: copper feedback link + faint fortheplot.today

### 2. Create Trip
- Back button (copper "←")
- "New Trip" heading + subtitle
- Tappable emoji picker (48px, grid of 15 options)
- Three input fields: name, trip name, subtitle
- Date picker component
- Full-width submit button (navy when valid, gray when empty)

### 3. Trip Board
- Navy gradient header (rounded bottom 28px)
  - Giant faint emoji watermark (120px, 6% opacity)
  - Back arrow, share pill (top corners)
  - Date range eyebrow (uppercase, letterspaced)
  - Trip name in Playfair Display 34px
  - Stats: "{N} items saved · live"
- Smart link input (copper left border, white card)
- Category sections (collapsible, with horizontal scrolling item cards)
- View toggle: By Category | By Day
- Clear All at bottom
- Install prompt (conditional)

### 4. Full-Screen Overlays
- Navy background, centered white/cream text
- Used for: Feedback ("hey, i'm atharva"), How It Works
- Copper ✦ mark at top
- Close × top-right

### 5. Bottom Sheets
- Cream background, rounded top corners
- Used for: Add Item, Share, Edit Trip, Item Detail, Install Instructions
- Grab handle + heading + content + CTA
