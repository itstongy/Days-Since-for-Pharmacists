# daysSince

Tiny static webpage to calculate **days since** a date (and optional medication supply estimate).

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
- `?s=25/06 30 1` (date, amount, tablets-per-day)

Also supports explicit params:
- `?date=25/06/2025&amount=30&perDay=1`

## Run
Open `index.html` in a browser.

Optionally serve locally:
```bash
python3 -m http.server 8080
```
Then visit: http://localhost:8080
