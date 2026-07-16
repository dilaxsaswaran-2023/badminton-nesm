# NESM 2026 Badminton Draw

Production organizer-facing knockout draw ledger for the NESM 2026 Badminton Championship. The App Router application loads the seven supplied CSV registers at runtime, creates reproducible seeded brackets, preserves official results in browser storage, and prints all generated categories as an A3 landscape document.

## Run locally

Node.js 22.13 or newer is required.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run test
npm run lint
npm run build
```

The source lists remain in `data/`; runtime copies are kept in `public/data/`. Review `DATA_REVIEW_NOTES.md` before publishing an official draw, and keep an entry ID unchanged after publication.
