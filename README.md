# Cap → Headcount Projector (Manual, No External Calls)

A tiny static web app. Type in a Soft Cap and/or Hard Cap number, and instantly see the
required headcount, space-capped recommendation, achievable volume, and shortfall per
cycle — using the same rate logic as the headcount planning workbook.

No screenshots, no OCR, no AI endpoint, no external network calls of any kind. Everything
computes locally in the browser. This sidesteps any compliance/endpoint-approval question
entirely, which is the right call for a tool this size.

## Features
- **Paste-and-parse**: copy the raw cap rows straight from the dashboard (timestamp,
  "Package count", label, value, breakdown) and paste into the box — Soft cap / Hard cap
  auto-fill and the projection updates immediately, no manual retyping needed.
- **Live results**: updates on every keystroke, no submit button.
- **Keyboard-fast entry**: press Enter to jump to the next field.
- **Adjustable rates**: expand "Rates & space caps" to tune induct/stow rates,
  specialization multipliers, efficiency, and physical head caps — changes are
  saved in your browser (localStorage) so they persist next time you open the app.
- **Reset to defaults** button if you want to revert any rate change.
- **Colour-coded rows**: green = target met at the space-capped recommendation,
  red = shortfall — recommended heads include a "+" when the space cap (not the rate)
  is the binding constraint, since adding heads won't help in that case.

## Setup
1. Push this folder to a new GitHub repo:
   ```bash
   gh repo create cap-headcount-projector --private --source=. --push
   ```
2. Enable GitHub Pages: repo Settings → Pages → Source: `main` branch, `/ (root)`,
   or let the included Actions workflow deploy it automatically on push.

## Local testing
Open `index.html` directly in a browser, or:
```bash
python3 -m http.server 8000
```
then visit `http://localhost:8000`.

## Files
- `index.html` / `style.css` — UI
- `rates.js` — default rate assumptions + localStorage load/save
- `headcount.js` — headcount/volume projection math
- `app.js` — live wiring, keyboard flow, settings panel
