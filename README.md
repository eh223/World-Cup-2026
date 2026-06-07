# World Cup Predictor 2026

Static GitHub Pages site for a World Cup prediction game.

## Update the site on GitHub

1. Unzip this folder.
2. Open your GitHub repository.
3. Click **Add file → Upload files**.
4. Drag all the unzipped files in.
5. Commit the changes.
6. Wait for **Actions → pages-build-deployment** to get a green tick.
7. Hard refresh the public page, or add `?v=3` to the end of the URL.

## Edit teams, players and bonus questions

Open `data.js`.

- `GROUPS` controls teams and groups.
- `PLAYER_TIERS` controls the four player lists. Replace the placeholder names with your real players.
- `BONUS_QUESTIONS` controls the 10 bonus questions.

## Set up Google Sheets to receive entries

1. Create a new Google Sheet.
2. Rename the first tab to `Responses`.
3. In the Google Sheet, go to **Extensions → Apps Script**.
4. Delete any starter code.
5. Paste in the contents of `Code.gs` from this ZIP.
6. Click **Save**.
7. Click **Deploy → New deployment**.
8. Click the cog/settings icon and choose **Web app**.
9. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
10. Click **Deploy**.
11. Authorise the app when Google asks.
12. Copy the Web App URL. It should end with `/exec`.
13. Open `app.js` and paste that URL into this line:

```js
const SCRIPT_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';
```

14. Upload the changed `app.js` to GitHub and commit it.

## Test submission

Open the public site, submit a test entry, then check the `Responses` tab in your Google Sheet.

If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New version → Deploy**. If you do not create a new version, Google may keep using the old script.


## Knockout bracket

Stage 3 now works in three parts:

1. Pick the 32 teams that qualify, choosing 2 or 3 from each group.
2. Assign those selected teams as group winner, runner-up and, where relevant, third place.
3. The site builds the knockout bracket from those positions, then asks entrants to pick one winner from each tie.

The third-place slots are assigned automatically using the official eligible group slots in the 2026 knockout structure.
