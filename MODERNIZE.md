# Modernisation plan (experimental branch)

Branch: `modernize/web-tech`

## Goals
- Keep the tool **fast**, **offline-capable**, and **privacy-first**.
- Improve maintainability: **TypeScript**, modules, linting/formatting, tests.
- Make shipping safer: CI, reproducible builds, automated GH Pages deploy.
- Make UI easier to evolve: componentised layout, consistent styling, accessibility.

## Recommended stack (pragmatic)
- **Vite** (build/dev server)
- **TypeScript** (strict)
- **Vanilla TS + small view layer** (choose one):
  - Option A: Vanilla TS + Web Components (no framework)
  - Option B: **Preact** (tiny React-compatible) for components/forms
- **CSS**: Tailwind (fast iteration) *or* keep custom CSS but split into files.
- **Date**: `date-fns` (or `Luxon`) to replace ad-hoc parsing.
- **Quality**: ESLint + Prettier + Vitest + Playwright (smoke test).

## Tailscale (how it fits)
Tailscale doesn’t belong in the shipped web app itself, but it’s useful for **dev + sharing**:
- Share your local dev server to another device on your Tailnet:
  - `tailscale serve https / http://localhost:5173`
- Or use **Funnel** to share externally (if enabled):
  - `tailscale funnel 5173`

This is optional; the deployed app remains static on GitHub Pages.

## Migration steps
1. **Scaffold** Vite + TS project
   - `npm create vite@latest days-since -- --template vanilla-ts` (or preact-ts)
   - Add `strict: true`, `noUncheckedIndexedAccess`, etc.
2. Split current single-file app into modules
   - `src/lib/date.ts` (parse/format)
   - `src/lib/calc.ts` (days-since + supply remaining)
   - `src/lib/frequency.ts` (timeline analysis)
   - `src/ui/*` components
3. Add tests
   - Unit tests for date parsing edge cases (DDMM, DD/MM/YY, year inference)
   - Unit tests for supply calculations and early-threshold logic
4. Add CI + Pages deploy
   - GitHub Actions: lint, test, build, deploy to GH Pages (from `dist/`)
5. Add PWA/offline
   - `vite-plugin-pwa` + simple caching
6. UX/accessibility pass
   - Keyboard flow, proper labels, aria for status updates
   - Mobile layout + reduced-motion

## Non-goals
- No backend.
- No patient-identifiable data storage.

## Notes
This file is a placeholder; we’ll refine after a critical review of the current implementation.
