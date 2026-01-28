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
- Reviewing dispensing patterns over time (repeat frequency / possible early supply)

## What it does
- Calculates **days since** a date
- Estimates **days of medication supply** if you enter amount + tablets per day
- Flags **OK to supply vs too early** based on an early‑supply buffer
- **Dispense frequency** view: paste multiple dispense dates to see average gap + a colour timeline (green OK / red early)

## Dispense frequency + timeline view (multiple dates)
Open **“Dispense frequency (multiple dates)”** and paste dispense dates.

### Inputs
- **Dispense dates:** one per line (or separated by spaces/commas)
- Optional:
  - **Quantity supplied each time** (assumes the same quantity for all dispenses)
  - **Tablets per day** (assumes constant daily use)
  - **Allowed early (days)** (default 9)

### Accepted date formats
- `DD/MM`, `DD/MM/YY`, `DD/MM/YYYY`
- Compact: `DDMM`, `DDMMYY`, `DDMMYYYY` (e.g. `2701` or `270126`)

### What the timeline shows
- Each **dot** is a dispense date.
- The spacing reflects the actual time between dispenses.
- Each segment between dates is labelled with the **gap in days**.
- With quantity + tablets/day entered:
  - Expected days of supply = `quantity / tabletsPerDay`
  - Early threshold = `expectedDaysOfSupply − bufferDays`
  - Segment is **red** if: `gapDays < (expectedDaysOfSupply − bufferDays)`
  - Segment is **green** otherwise.

### “Net tablets” estimate (ledger)
The tool can also estimate a running “tablet balance” over the date range:
- Assumes **starting balance = 0** at the first date you entered.
- Adds `quantity` at each dispense date.
- Subtracts consumption between dates: `gapDays × tabletsPerDay`.

It reports:
- **Net tablets at last dispense date** (does not “ghost consume” beyond your last entered date)
- Optional: **Projected net tablets today** (toggle in the UI)

> Caveat: This assumes the dates you entered represent all supplies (no other supplies elsewhere) and that use is constant.

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
