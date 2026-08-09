# Caseload

A caseload management tool built for Lindsay McManus, Psy.S, MA. Tracks cases,
outstanding tasks (ETRs, IEP reviews, FBA/BIP, 504 reviews, etc.), the support
team on each case, and optional time logging.

Data is stored in the browser's `localStorage` — it stays on whichever device
and browser you use it in. Nothing is sent to a server. The first time it's
opened in a browser, it loads with sample data so you can see how it works;
use **Clear all data** in the sidebar to start fresh, or **Reset sample data**
to put the demo data back.

## Run it locally

You'll need [Node.js](https://nodejs.org) installed (18 or newer).

```bash
npm install
npm run dev
```

Then open the local URL it prints (usually `http://localhost:5173`).

## Publish it on GitHub Pages

**Option A — automatic (recommended).** This project already includes a
GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and
deploys on every push to `main`.

1. Create a new repository on GitHub and push this project to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
2. In the repo on GitHub: **Settings → Pages → Build and deployment → Source**,
   choose **GitHub Actions**.
3. Push to `main` (or re-run the workflow from the **Actions** tab). After it
   finishes, your site is live at:
   `https://YOUR-USERNAME.github.io/YOUR-REPO/`

**Option B — manual, no Actions.** Build locally and publish the `dist`
folder with the `gh-pages` package:

```bash
npm install
npm run build
npx gh-pages -d dist
```

Then in **Settings → Pages**, set the source branch to `gh-pages`.

## Notes

- Because data lives in `localStorage`, it's local to one browser. Using it
  on a phone and a laptop means two separate, unsynced copies. If that
  becomes a problem, the storage layer (`useStore` in `src/App.jsx`) is the
  one place that would need to change to talk to a real backend instead.
- Private browsing / incognito windows usually clear `localStorage` when
  closed — avoid those for real use.
