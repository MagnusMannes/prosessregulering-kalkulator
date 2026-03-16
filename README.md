# DiffCraft – Prosessregulering kalkulator

En moderne, statisk webapp som kan hostes direkte med **GitHub Pages**.

## Hva siden gjør

- Lar brukeren skrive inn differenslikning med en **enkel koeffisient-editor**:
  - `a` for tilbakekobling (`y[k-1], y[k-2], ...`)
  - `b` for inngang (`u[k-1], u[k-2], ...`)
  - bias/konstant
- Viser ligningen automatisk som **LaTeX-matematikk**.
- Genererer et **sentrert, lettlest blokkdiagram** med store blokker.

## Publisering på GitHub Pages

1. Push branchen til GitHub.
2. Gå til repo → **Settings** → **Pages**.
3. Under **Build and deployment**, velg:
   - Source: `Deploy from a branch`
   - Branch: `main` (eller ønsket branch), mappe `/ (root)`
4. Lagre – siden blir tilgjengelig på GitHub Pages URL-en.

Ingen byggesteg trengs siden appen består av `index.html`, `styles.css` og `app.js`.
