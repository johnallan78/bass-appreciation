# Bass Ledger

Static, responsive website for hosting and indexing bass guitar and double bass transcription PDFs on GitHub Pages.

## Features

- Modern dark UI with responsive layout
- Client-side transcription index from `data/transcriptions.json`
- Search, instrument filter, tag filter, and sort
- PDF hosting from `transcriptions/`
- No browser upload workflow (code-managed content only)

## Project structure

```text
.
├── .github/workflows/deploy-pages.yml
├── assets/images/
├── data/transcriptions.json
├── index.html
├── scripts/app.js
├── styles/main.css
└── transcriptions/
```

## Add a new transcription

1. Copy your PDF into `transcriptions/` using a clear filename (example: `teen-town-jaco-pastorius.pdf`).
2. Add a record to `data/transcriptions.json`:

```json
{
  "id": "teen-town-jaco-pastorius",
  "title": "Teen Town",
  "instrument": "bass-guitar",
  "composerOrArtist": "Jaco Pastorius",
  "difficulty": "advanced",
  "tags": ["jazz-fusion", "16th-notes"],
  "pdfPath": "transcriptions/teen-town-jaco-pastorius.pdf",
  "updatedAt": "2026-05-10"
}
```

3. Commit and push. The site index updates automatically from JSON on load.

## Deployment (GitHub Pages)

This repository includes `.github/workflows/deploy-pages.yml` for GitHub Pages deployment.

1. Push to the `main` branch.
2. In repository settings, ensure **Pages** is configured to use **GitHub Actions**.
3. After workflow success, your site will be available at the repository Pages URL.

## Notes

- This is intentionally a static site with no authentication.
- There is no upload form in the UI. Content changes happen through repository commits only.

## Stock image sources used

- Unsplash (hero): <https://unsplash.com/photos/0t5wMsv1Zco>
- Pexels (catalog cards texture): <https://www.pexels.com/photo/wooden-double-bass-beside-wall-164936/>

License references:

- Unsplash License: <https://unsplash.com/license>
- Pexels License: <https://www.pexels.com/license/>
