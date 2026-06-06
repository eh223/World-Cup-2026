# World Cup Predictor 2026

Static GitHub Pages site for a private World Cup prediction game.

## Files
- `index.html` — page structure
- `styles.css` — design
- `data.js` — teams, players and bonus questions
- `app.js` — form generation, review, validation and submit
- `Code.gs` — optional Google Apps Script receiver for Google Sheets

## Publish on GitHub Pages
1. Log in to GitHub.
2. Create a new public repository, e.g. `world-cup-predictor`.
3. Upload these files to the repository root.
4. Go to **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Branch: `main`; folder: `/root`; click **Save**.
7. After a minute or two, GitHub will show the site URL.

## Connect Google Sheets
1. Create a Google Sheet and rename the first sheet `Entries`.
2. Open **Extensions → Apps Script**.
3. Paste in `Code.gs`.
4. Deploy → New deployment → Web app.
5. Execute as: **Me**. Who has access: **Anyone**.
6. Copy the Web App URL.
7. Paste it into `app.js` as `SCRIPT_URL`.
8. Commit/push the updated `app.js` to GitHub.

## Customise
Edit `data.js` to update players and bonus questions. Edit the deadline text in `index.html`.
