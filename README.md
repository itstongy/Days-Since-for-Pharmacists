# Days Since (for Pharmacists)

Tiny static webpage to calculate **days since** a date and (optionally) estimate **days of medication supply remaining**.

Built for quick “too early vs due” checks: enter the last supply date + quantity + tablets/day.

## Inputs
- Date formats:
  - `DD/MM`
  - `DD/MM/YY`
  - `DD/MM/YYYY`

If you provide `DD/MM` with no year, it will pick the **most recent occurrence**:
- Example: if today is before `25/06`, then `25/06` is interpreted as **25/06 last year**.

## Search-engine shortcut ("%s" style)
Use query param `s`:
- `?s=25/06`
- `?s=25/06 30 1` (date, amount, tablets, tablets-per-day)

This makes it ideal for a browser keyword/search shortcut (paste the URL template with `%s`).

Also supports explicit params:
- `?date=25/06/2025&amount=30&perDay=1`

## Run
Open `index.html` in a browser.

Optionally serve locally:
```bash
python3 -m http.server 8080
```
Then visit: http://localhost:8080
