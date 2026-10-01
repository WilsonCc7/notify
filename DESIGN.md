# DESIGN.md - Notify v1

Design read: closed-friends school planner, playful but productive. Notion-calm structure, ChronoTask energy in the hero. Tailwind v4 tokens, no component library, no shadcn.

Dials: `DESIGN_VARIANCE 7` / `MOTION_INTENSITY 6` / `VISUAL_DENSITY 3`. Airy on landing, denser on the dashboard but never cockpit.

## 1. Tokens

Single source of truth lives in `app/globals.css` under `@theme`. Every component consumes these, never a literal hex.

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--color-accent` | `#2563EB` | primary CTA, active tab, focus ring, progress fill |
| `--color-accent-hover` | `#1D4ED8` | CTA hover / active |
| `--color-accent-subtle` | `#EFF6FF` | selected row tint, badge bg |
| `--color-canvas` | `#FAFAFA` (zinc-50) | page background |
| `--color-surface` | `#FFFFFF` | cards, inputs, sheet |
| `--color-line` | zinc-200 | borders and dividers |
| `--color-muted` | zinc-500 | secondary text, placeholders |
| `--color-text` | zinc-900 | headings and body |

Rules:
- One accent, project-wide. No second accent anywhere, including empty and error states.
- Neutral family is zinc, never a mix of warm and cool grays.
- Status colors only as small semantic chips: amber for due soon, rose for overdue, zinc for done. Never a colored card background.
- Banned: purple/violet glow, neon gradient mesh, any `from-purple-500 to-blue-500`.

### Radius (one system, three steps)

| Token | Value | Use |
| --- | --- | --- |
| `--radius-card` | `16px` | every card, panel, modal, popover |
| `--radius-input` | `12px` | inputs, textarea, select, avatar square |
| `--radius-pill` | `9999px` | every button, chip, badge, toggle |

No other radius value ships. Pills for interactive, 16px for containers, 12px for fields.

### Type

`next/font`, no `<link>` to Google Fonts.
- `Outfit` (variable) for display: h1, h2, card titles, big numbers.
- `Geist` (variable) for everything else: body, labels, inputs, nav, tables.

Scale (Tailwind classes):
- h1 landing `text-5xl md:text-7xl tracking-tighter leading-[0.95]`, Outfit, one line in ink, second line in `text-muted`.
- h1 dashboard `text-3xl tracking-tight`.
- h2 / card title `text-lg font-semibold`.
- body `text-base leading-relaxed text-muted`, `max-w-[65ch]`.
- labels `text-sm font-medium`.
- eyebrow `text-xs font-medium uppercase tracking-[0.14em] text-muted`. Cap: 2 eyebrows on the landing page total.

### Iconography

`@phosphor-icons/react` only. `weight="regular"` default, `weight="bold"` for active nav, `weight="fill"` for a checked box. Sizes 16 / 20 / 24 only. No hand-rolled SVG paths, no emoji in UI or copy.

### Elevation

One shadow, tinted cool, never pure black: `0 1px 2px rgb(24 24 27 / 0.04), 0 8px 24px rgb(24 24 27 / 0.06)`. Cards use `border border-zinc-200` plus that shadow. Divider rows use `divide-y divide-zinc-100`, not individual card chrome.

### Motion (intensity 6)

- Card and list entry: fade + 8px rise, 180ms, stagger 30ms, once.
- Hover on cards: `hover:-translate-y-0.5` plus shadow lift. Press: `active:scale-[0.98]`.
- Kanban drag later: 150ms spring on drop only, no continuous follow animations.
- Everything above wraps `prefers-reduced-motion: reduce` to a plain fade.

## 2. Two modes on `/`

Same route, two completely different shells. Server component reads the session and picks one. Never mix them.

| | Landing (Persuade) | Dashboard (Operate) |
| --- | --- | --- |
| Trigger | no session cookie | valid session cookie |
| Nav | wordmark left, links center (one line, <=72px), `Sign in` ghost + `Get started` pill right | wordmark + subject switcher left, `Link Google` + avatar right |
| Hero | left-aligned headline, 2 lines max, subtext <=20 words, one accent CTA, asymmetric right column with 2 floating cards (slight rotation, offset overlap) | greeting row with name + date, then task board |
| Content | one alternating section pair, then a single wide CTA band. Never three equal feature cards | one column of sections: due soon, custom tasks, per-subject list |
| Density | `gap-20` vertical rhythm, generous whitespace | `gap-6`, one card per row on mobile, 2 columns at `lg` |
| Copy | short, warm, second person, present tense | functional: counts, due times, empty-state instructions |
| CTA | one primary intent per screen, 3 words max | per-row actions (move, add), no hero CTA |

Landing rules carried from the reference:
- Hero sits in a rounded panel with a soft shadow on `--color-canvas`, never full-bleed dark.
- Floating cards break the hero edge (2 cards only), rotate between -3deg and 3deg, never more than 3.
- Headline is two-tone (ink + muted), same font both lines, emphasis by weight only, never a second font family.

Dashboard rules carried from the reference:
- Greeting mixes weights in one family: `Good morning,` in muted light, name in bold ink.
- Section headers: title left, one action right. Never a left-headline + right-explainer header.
- Rows carry status as a chip or checkbox, not a colored bar fill.

## 3. Responsive

Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`.

| Range | Layout |
| --- | --- |
| `< 640` | single column, `px-4`, cards full width, nav collapses to avatar + sheet |
| `640-1023` | single column content, 2-up stat row, floating hero cards hidden (one inline card instead) |
| `1024-1279` | content `max-w-[1400px] mx-auto px-8`, sidebar rail optional |
| `>= 1280` | full desktop: subject rail + board |

Hard rules:
- `min-h-[100dvh]`, never `h-screen`.
- Grid over flex math: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`, no `w-[calc(33%-1rem)]`.
- Kanban (`/s/[courseId]`, later phase) is CSS grid, 3 equal columns at `>= 768`, drag via `@dnd-kit` on pointer devices only.
- Below `768` the board becomes a single stacked list ordered Todo, Doing, Done. Status change happens in a row action menu. No touch-drag library, no drag handles on mobile.
- Tap targets >= 44px on mobile.
- Focus ring is always visible: `focus-visible:ring-2 ring-accent ring-offset-2`.

## 4. Pre-flight bans

Fail the build on any of these.

1. **No purple glow, no AI gradient.** No violet/indigo anywhere, no radial glow behind the hero, no `bg-gradient-to-br from-purple-*`.
2. **No three equal feature cards.** Never a `grid-cols-3` of identical icon + title + sentence cards. Use an asymmetric 2:1 split, or one wide band.
3. **No fake data visuals.** No chart libraries, no progress rings, no donut arcs, no activity sparkline, no streak tracker, no filled-track percentage bars, no time tracker. If Notify has no real metric for it, the widget does not exist. Real numbers only: counts, due dates, real completed counts.
4. **No em-dashes in copy.** Zero `—` in any user-visible string: headlines, eyebrows, buttons, placeholders, empty states, error text, `alt`. Use a comma, a colon, or two sentences.
5. **No invented metrics.** No "Trusted by 10,000 students", no fake logos, no testimonials from fictional people.
6. **No scroll cues**, no version labels, no `BRAND MOTION SPATIAL` text strips, no decorative dot rows, no section-number eyebrows (`01 / Overview`).
7. **No emoji in copy or UI.** Phosphor only.
8. **One theme.** Light only in v1. No section that flips to a dark band mid-page.
9. **One accent.** No per-section accent swap, no second accent for "success".
10. **CTAs**: label must fit one line at desktop, 3 words max, WCAG AA contrast. No white text on white, no transparent button without a border.
11. **No duplicate CTA intent** on one screen.
12. **Every list has real states**: loading skeleton matching final layout, empty state that says what to do next, inline form errors. No spinner-only screens.
