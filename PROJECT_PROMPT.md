# NESM 2026 Badminton Draw — Build Prompt

You are a senior frontend engineer and product designer. Build a complete, production-quality web application named **NESM 2026 Badminton Draw**.

## Goal

Create an organizer-facing web page that loads tournament entrants from seven separate CSV files, performs a fair independent random knockout draw for each category, displays a proper multi-round bracket, animates the draw, preserves the generated result, and allows the organizer to print or save the official draw as a PDF.

Do not use a backend or database. The application must work using the CSV files in `public/data` and browser storage.

## Required stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Papa Parse for CSV loading
- Motion/Framer Motion for the draw animation
- Lucide React for interface icons
- Native `window.print()` with a dedicated print stylesheet for Print / Save as PDF
- Vitest (or the project's existing test runner) for draw-logic tests

Keep dependencies minimal. Use strict TypeScript and avoid `any`.

## Data files

Use these files exactly as the source of truth:

- `/data/mens-singles.csv`
- `/data/mens-doubles.csv`
- `/data/men-over-40-singles.csv`
- `/data/men-over-40-doubles.csv`
- `/data/womens-singles.csv`
- `/data/womens-doubles.csv`
- `/data/mixed-doubles.csv`
- `/data/categories.json`

Load the CSVs at runtime using `fetch` and parse them with Papa Parse. Trim all values and ignore empty rows. Validate that `entry_id` and `player_1` are present and that IDs are unique within a category. Show a graceful error panel if a file cannot be loaded or is invalid.

CSV columns are:

- `entry_id`
- `player_1`
- `player_2`
- `status` (`complete` or `partner_pending`)

For singles, display `player_1`. For a completed doubles team, display `player_1 & player_2`. For a doubles row with `partner_pending`, display `player_1 — Partner pending` and keep that placeholder as one valid draw entry so the partner can later be added without changing the draw position.

## Knockout draw rules

Implement the bracket logic in pure, independently testable TypeScript utilities.

1. Each category is shuffled independently.
2. Create a new random 32-bit seed with `crypto.getRandomValues` every time a category is drawn.
3. Use a deterministic seeded Fisher–Yates shuffle so the same seed and entrant list reproduce the same draw.
4. Calculate the bracket size as the next power of two: 2, 4, 8, 16, 32, and so on.
5. The number of byes is `bracketSize - entrantCount`.
6. Allocate first-round byes fairly. Avoid BYE-vs-BYE matches. Shuffle the entrants before deciding which entrants receive byes.
7. A player/team facing a BYE must automatically advance to the next round.
8. Never duplicate or drop an entrant.
9. Create stable match labels such as `R1-M01`, `R1-M02`, etc.
10. Later rounds must show `Winner of R1-M01` placeholders until results are entered; this project only creates the draw and does not need score entry.

Display the draw seed, generation date/time, entrant count, bye count, and a short draw reference code on the official result. Save each category's generated bracket to `localStorage` so refreshing the page does not change it. Redrawing an existing category must require confirmation. Include Reset category and Reset all actions with confirmation.

## Pages and interaction

Build a polished single-page experience with these sections:

### 1. Header

- NESM 2026 archival-style badge/monogram
- Title: `NESM 2026 Badminton Championship`
- Subtitle: `Official Knockout Draw Ledger`
- Small status: `7 categories • Knockout format`

### 2. Category index

Show seven compact category tabs/cards with entrant count and draw state:

- Men's Singles
- Men's Doubles
- Men Over 40 – Singles
- Men Over 40 – Doubles
- Women's Singles
- Women's Doubles
- Mixed Doubles

The active category must be keyboard accessible and visually clear.

### 3. Pre-draw ledger

Before a draw, show the loaded entrants in a numbered, two-column paper ledger. Mark incomplete doubles entries with a subtle amber `Partner pending` label. Include a data-loaded success indicator.

### 4. Draw controls

Include:

- `Conduct Draw` for the selected category
- `Draw All Remaining` for every category that has not been drawn
- `Print / Save PDF`, disabled until at least one category has a result
- `Reset` menu

Do not silently redraw a finished category.

### 5. Draw animation

When conducting a draw, show a 1.5–2 second ceremonial animation inspired by numbered paper slips being mixed in an old wooden tournament box:

- player/team name slips move, shuffle, blur slightly, and settle
- a progress message changes through `Sealing entries`, `Shuffling the field`, and `Setting the bracket`
- reveal first-round matches sequentially with a restrained ink-stamp effect
- avoid flashy casino styling, confetti, neon, or slot-machine visuals
- respect `prefers-reduced-motion` and provide an immediate accessible result when reduced motion is enabled

Disable draw controls during the animation.

### 6. Bracket result

Render a true knockout bracket with columns for every round and visible connector lines. Use round titles appropriate to the bracket size: Round of 32, Round of 16, Quarter-finals, Semi-finals, and Final. Clearly display match numbers, entrant names, BYEs, automatic advances, and winner placeholders.

The bracket must:

- remain readable on desktop
- use horizontal scrolling on smaller screens
- have a useful mobile fallback showing rounds as stacked match cards
- use semantic headings and accessible labels
- never clip long player/team names

Add an `Official Draw` seal only after the bracket is generated. Provide a small `Copy draw summary` action that copies first-round matches and bye assignments as plain text.

## Visual direction

Create a classical documentary/archive look with a book-like feeling.

- Background: warm parchment with subtle paper grain, faded edges, and a gentle central book-spine shadow
- Main surface: a large open-ledger/card layout, not a generic dashboard
- Palette: parchment `#E9DFC8`, old paper `#F6F0E2`, ink `#2A2118`, oxblood `#6D2723`, forest green `#244638`, antique gold `#A98245`
- Typography: a handwriting/script font only for decorative accents and seals; use an elegant readable serif such as Cormorant Garamond, Libre Baskerville, or Playfair Display for body text and player names
- Use thin rules, folio numbers, archival labels, ink stamps, restrained shadows, and small badminton-inspired line details
- Avoid excessive rounded cards, gradients that look modern/SaaS-like, glassmorphism, neon colors, oversized empty hero space, and unreadable script body text
- The design should feel premium, formal, calm, and suitable for an official sports document

Use CSS for paper texture and decorative geometry so there is no dependency on external background images. Maintain strong contrast and visible focus states.

## Print and PDF requirements

The `Print / Save PDF` button must open the browser print dialog so the organizer can choose Save as PDF.

Create a dedicated print-only official document:

- hide navigation, buttons, animations, and nonessential notes
- include tournament title, category, generated date/time, seed/reference, entrant count, and bye count
- print each generated category on a new page
- use `@page { size: A3 landscape; margin: 10mm; }` for large brackets
- use ink-friendly colors and a white/light paper background
- preserve bracket connector lines and avoid splitting a match card across pages
- include footer text: `NESM 2026 • Official Knockout Draw`
- if the browser cannot honor A3 automatically, the content must still scale without clipping

## Suggested project structure

    app/
      page.tsx
      globals.css
    components/
      tournament-draw.tsx
      archival-header.tsx
      category-index.tsx
      entrant-ledger.tsx
      draw-controls.tsx
      draw-animation.tsx
      knockout-bracket.tsx
      match-card.tsx
      print-draw.tsx
    lib/
      csv.ts
      draw.ts
      bracket.ts
      storage.ts
      types.ts
    public/data/
      categories.json
      mens-singles.csv
      mens-doubles.csv
      men-over-40-singles.csv
      men-over-40-doubles.csv
      womens-singles.csv
      womens-doubles.csv
      mixed-doubles.csv
    tests/
      draw.test.ts
      bracket.test.ts

You may adjust component boundaries, but keep data loading, draw logic, bracket generation, UI, and print presentation clearly separated.

## Minimum tests

Add tests proving:

- `nextPowerOfTwo(31) === 32`
- 31 entrants produce 1 bye
- 16 entrants produce no byes
- 10 entrants produce a 16-slot bracket and 6 byes
- 5 entrants produce 3 byes and no BYE-vs-BYE match
- every entrant appears exactly once in round one
- the same input and seed produce the same result
- different seeds can produce different results
- automatic bye advancement is correct
- partner-pending rows retain their label and bracket position

## Quality and completion requirements

- Use the supplied CSV values; do not replace them with mock names.
- Do not hard-code entrants inside React components.
- Do not mutate the original parsed entrant array.
- Add loading, empty, and error states.
- Avoid hydration errors and console errors.
- Run lint, tests, and the production build; fix every error before finishing.
- Verify the page at desktop and mobile widths.
- Verify that all seven categories load, draw independently, persist after refresh, reset correctly, and print without clipped bracket content.

Finish by summarizing the implemented features, listing important files, and reporting the lint/test/build results.
