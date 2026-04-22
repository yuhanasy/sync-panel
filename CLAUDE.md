# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server
npm run build      # tsc -b && vite build
npm run lint       # eslint
npm run test       # vitest run (single pass)
npm run test:watch # vitest watch
npx vitest run src/path/to/__tests__/file.test.tsx  # single test file
```

## Architecture

- **Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Zustand, TanStack Query, Lucide React
- **`@/`** aliases to `src/` (configured in both `vite.config.ts` and `vitest.config.ts`)
- **Tailwind v4** — plugin-based via `@tailwindcss/vite`, no `tailwind.config.ts`, no PostCSS
- **Data flow:** `src/data/*.ts` (mock seeds) → `src/stores/*.ts` (Zustand) → `src/pages/*.tsx`
- TanStack Query used **only** for the real Sync Now API call; everything else reads from stores
- Tests are co-located in `__tests__/` subdirectories next to source files

## Domain Rules

- Only **Sync Now** hits the real API (`GET https://portier-takehometest.onrender.com/api/v1/data/sync`)
- Conflicts are **pre-seeded** in `src/data/conflicts.ts` — API has no entity IDs so conflict detection can't be derived from API responses (see `references/assumptions.md` §5)
- `status: 'conflict'` blocks Sync Now until conflicts are resolved
- Approving sync → `bumpVersion` (patch +1) + `addEntry` to history
- Merging conflicts → `updateStatus('synced')` + clear conflict items

## Workflows

- create plan first when the task is quite complex using /agent-skills:plan
- always check the plan first and continue next phase
- implement using /agent-skills:build to build incrementally and to use TDD
- always stop at checkpoint, marks the completed tasks and plans to done, then ask confirmation before committing changes.
- when all plans and todos are completed, move them to `tasks/archive/`. then ready for next planning.
