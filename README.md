# DiffCraft – Prosessregulering kalkulator

En moderne, statisk webapp som kan hostes direkte med **GitHub Pages**.

## Hva siden gjør

- Lar brukeren **dra og slippe blokker** for å bygge differenslikninger.
- Lar brukeren redigere **koeffisient** og **forsinkelse** per ledd.
- Viser ligningen automatisk i tekstformat.
- Genererer et **blokkdiagram automatisk** fra ligningen.
- Har hurtigeksempel for rask demo.

## Publisering på GitHub Pages

1. Push branchen til GitHub.
2. Gå til repo → **Settings** → **Pages**.
3. Under **Build and deployment**, velg:
   - Source: `Deploy from a branch`
   - Branch: `main` (eller ønsket branch), mappe `/ (root)`
4. Lagre – siden blir tilgjengelig på GitHub Pages URL-en.

Ingen byggesteg trengs siden appen består av `index.html`, `styles.css` og `app.js`.
