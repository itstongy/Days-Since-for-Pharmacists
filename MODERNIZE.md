# Modernization plan (modernize/web-tech)

## Brief plan
1. Scaffold Vite + TypeScript + Tailwind with linting, formatting, and tests.
2. Move core logic into typed, pure modules with Vitest coverage for date parsing and calculations.
3. Rebuild UI/UX with accessible, keyboard-friendly layout and theme toggle.
4. Add CI + GitHub Pages deploy workflows and update documentation.

## Migration checklist
- [x] Replace monolithic `index.html` with Vite entry + modular TS.
- [x] Tailwind + PostCSS configured with Prettier plugin.
- [x] Strongly typed modules: date parsing, supply math, frequency analyzer, share URL.
- [x] Vitest tests for parsing and core calculations.
- [x] Accessible UI: labels, aria-live, keyboard shortcuts, theme toggle, reset.
- [x] GitHub Actions: CI and Pages deploy (base `/Days-Since-for-Pharmacists/`).
- [x] Documentation refreshed.

Notes: App remains 100% client-side/static and deployable to GitHub Pages under `/Days-Since-for-Pharmacists/`.
