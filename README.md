# Days Since for Pharmacists

Fast, simple, and private. **Days Since for Pharmacists** is a lightweight web tool to calculate “days since” a supply date and (optionally) estimate medication supply remaining. It is built for quick **due vs too early** checks in busy pharmacies.

**Try it now →** https://itstongy.github.io/Days-Since-for-Pharmacists/

## Why pharmacists use it
- **Save time**: no more counting days on a calendar or doing manual date math
- **Reduce errors**: consistent “too early vs due” checks with a clear buffer
- **Stay fast at the counter**: works in seconds, on any device, no logins
- **Privacy‑friendly**: runs fully in your browser, nothing is saved or sent

## Common use cases
- Checking whether a repeat is **too early or due** while serving a line
- Estimating **days of supply remaining** from tablets and daily dose
- Handling quick phone queries (“Is it due yet?”) without digging into notes
- Training new staff on consistent early‑supply rules and date handling

## What it does
- Calculates **days since** a date
- Estimates **days of medication supply** if you enter amount + tablets per day
- Flags **due vs too early** based on an early‑supply buffer

## Privacy first
This tool runs entirely in your browser. **No data is saved, stored, or sent anywhere.**

## Easy inputs (non‑technical)
- **Date formats:** `DD/MM`, `DD/MM/YY`, `DD/MM/YYYY` (or compact `DDMM`, `DDMMYY`, `DDMMYYYY`)
- **Optional meds:** add `amount` then `perDay` (e.g. `25/06 60 2`)
- **Optional buffer:** add `&buffer=9` to the URL (default 9)

## Power‑user URL formats
- `?s=25/06` or `?s=25/06/2025`
- `?s=25/06 30 1` (date, amount, per‑day)
- `?date=25/06/2025&amount=30&perDay=1&buffer=9`

## Run locally
Open `index.html` in a browser, or serve locally:
```bash
python3 -m http.server 8080
```
Then visit: http://localhost:8080
