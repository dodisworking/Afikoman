# Afikoman

## Shalom Ogilvy — Passover email capture

Static one-page site: canvas starfield, breathing matzah, sci-fi UI (Orbitron / Exo 2), email signup that posts to **Google Sheets** via **Google Apps Script**.

The Apps Script source lives in this repo under [`apps-script/Code.gs`](apps-script/Code.gs). You sync it with Google using **[clasp](https://github.com/google/clasp)** (the official CLI) so you are not copy-pasting code in the browser.

**Important:** “Full control” here means **you** (and anyone with repo + Google access) edit `Code.gs` locally and run `npm run gas:push`. An AI assistant cannot log into your Google account for you; clasp runs **on your machine** after a one-time `clasp login`.

## Run the static site locally

Browsers block `fetch` from `file://`, and opening `index.html` directly can look broken. **Always** serve the folder that contains `index.html`.

From the **repo root** (the same folder as `package.json`):

```bash
npm start
```

Or:

```bash
python3 -m http.server 8080
```

Open exactly: **`http://127.0.0.1:8080/`** or **`http://localhost:8080/`**

If you see a **blank page** or a **directory listing**:

- You are probably running the server from the **wrong directory** (e.g. a parent folder). `cd` into this project so `index.html` is in the current folder, then run `npm start` again.
- Or you opened the wrong URL (e.g. wrong port). The default in `npm start` is **port 8080**.

Set `SHEETS_ENDPOINT` in `config.js` after you have a Web app URL (below).

## GitHub Pages

1. Push this repo (keep `index.html` at the **repo root**).
2. **Settings → Pages →** Deploy from branch **main**, folder **`/` (root)**.
3. Site URL: `https://<username>.github.io/<repository>/`

## Apps Script from the repo (clasp — no copy-paste)

### One-time setup

1. **Create a Google Sheet** with a header row, for example:

   | Timestamp | Email |
   | --------- | ----- |

2. **Open the bound script:** in the sheet, **Extensions → Apps Script**. Copy the **script ID** from the URL:

   `https://script.google.com/home/projects/THIS_PART_IS_THE_SCRIPT_ID/edit`

3. **Install dependencies** (from the repo root):

   ```bash
   npm install
   ```

4. **Link this repo to that script:**

   ```bash
   cp apps-script/.clasp.json.example apps-script/.clasp.json
   ```

   Edit `apps-script/.clasp.json` and set `scriptId` to the ID you copied.

5. **Sign in to Google** (opens a browser):

   ```bash
   npm run gas:login
   ```

6. **Push the code** from your machine to Google:

   ```bash
   npm run gas:push
   ```

   If Google already has different files, you may need `npm run gas:pull` once, merge carefully, then `gas:push`.

### First Web app deployment (still done in the browser once)

Clasp uploads code; the **Web app** deployment and its URL are managed in Apps Script:

1. In the browser, open the project: `npm run gas:open` (or open the script from the Sheet).
2. **Deploy → New deployment →** select type **Web app**.
3. **Execute as:** Me  
4. **Who has access:** **Anyone**
5. Deploy and copy the **Web app URL** (ends with `/exec`).

Put it in `config.js`:

```javascript
window.SHEETS_ENDPOINT = "https://script.google.com/macros/s/.../exec";
```

### After you change `Code.gs`

```bash
npm run gas:push
```

Then either:

- **Deploy → Manage deployments** in the Apps Script UI and create a **new version** for the Web app, or  
- Run `npm run gas:deploy` and follow the prompts (creates a deployment; you may still need the Web app type configured the first time).

The `/exec` URL usually stays the same; you are publishing a new version of the same deployment.

### Useful commands

| Command | Purpose |
| ------- | ------- |
| `npm run gas:push` | Upload local `apps-script/` to Google |
| `npm run gas:pull` | Download Google’s version into `apps-script/` |
| `npm run gas:open` | Open the script in the browser |
| `npm run gas:deploy` | Create a deployment (see clasp docs) |
| `npm run gas:status` | Show clasp project info |
| `npm run gas:logs` | Stream logs (if enabled) |

### What to put in `config.js`

Only the **Web app URL** from **Deploy** (the `/exec` link). You do not need to paste the script source into Chat or share passwords; the script ID in `.clasp.json` stays on your machine (and is gitignored).

## Test the Sheet integration

After you deploy the Web app and set `SHEETS_ENDPOINT` in `config.js`, run:

```bash
npm run test:sheets
```

That POSTs a test email (`sheet-test@example.com`) the same way the browser does. Check your Sheet for a new row. You can also pass a URL once:

```bash
WEBAPP_URL="https://script.google.com/macros/s/.../exec" npm run test:sheets
```

## Customize

- **Clue text:** edit `PLACEHOLDER_CLUE` in `app.js`.
- **Matzah image:** replace `assets/matzah.png`. If the file came from a stock site (e.g. watermarked previews), use a version you are licensed to publish for a public site.
- **Server logic:** edit [`apps-script/Code.gs`](apps-script/Code.gs), then `npm run gas:push`.

## Troubleshooting

- If submit fails, confirm `SHEETS_ENDPOINT` matches the deployed Web app and access is **Anyone**.
- If `gas:push` fails, run `npm run gas:login` again and check `scriptId` in `apps-script/.clasp.json`.
- If the browser blocks `fetch` (CORS), confirm the deployment is a **Web app** and try another browser.
