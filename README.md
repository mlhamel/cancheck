# CanCheck 🍺⤵️

Bilingual (EN/FR) web app that scans the **UPC barcode** on a beer can, bottle or
box with the phone camera and tells you instantly whether the product is on the
CFIA recall list for the **November 2026 Molson Coors beer recall (pieces of
metal)** — 29 product formats, 7 brands, Canada-wide.

Pure JavaScript: no framework, no build step, no backend. Static files +
barcode scanning via the [`zxing-js`][zxing] library's CDN build.

[zxing]: https://github.com/zxing-js/library

## How it works

1. **Scan** — the camera targets the striped UPC/EAN barcode (QR codes on cans
   are marketing links and are politely rejected).
2. **Result** —
   - UPC **on the recall list** → ⚠️ product format recalled, with brand,
     format and the **affected lot codes** to check against the code printed on
     the package. Do not consume; return to the point of purchase.
   - UPC **not on the list** → ✅ not recalled *as of the data date*, with a
     caveat and a link to the official notice.
3. **Manual fallback** — any 12/13-digit UPC can be typed by hand (spaces are
   ignored; EAN-13 `0`-prefixed codes are normalized to UPC-12).

## Updating the recall data

All affected products live in `data.js` (UPCs as strings — leading zeros
matter). To refresh after a CFIA update, re-read the
[official notice](https://recalls-rappels.canada.ca/en/alert-recall/various-brands-alcoholic-and-non-alcoholic-beer-recalled-due-pieces-metal),
edit `data.js` and bump `RECALL_META.lastUpdated`. The test suite validates
every UPC's check digit, so transcription typos fail CI.

## Development

```sh
npm install
npm test        # node --test — lookup logic + dataset integrity
npm run lint    # eslint 9 (flat config)
npm run serve   # http://localhost:3000 (or any static server)

```

Camera access requires a secure context: use `localhost`, or serve over HTTPS /
GitHub Pages.

## Deployment (GitHub Pages)

Push the repo to GitHub, then **Settings → Pages → Deploy from branch →
`main` /` root**. The app is served at
`https://<user>.github.io/<repo>/`.

## Scope

- Not medical or legal advice; always verify against the official CFIA notice.
- The UPC identifies the product **format**; the affected **lot codes** shown
  in the app must still be checked against the code printed on the package.
- No history, no analytics, no cookies or trackers; the only thing stored is
  your language preference (`localStorage`), which never leaves the device.
