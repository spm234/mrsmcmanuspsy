# Caseload

A caseload management tool built for Lindsay McManus, Psy.S, MA. Tracks cases,
outstanding tasks (ETRs, IEP reviews, FBA/BIP, 504 reviews, etc.), the support
team on each case, a calendar of upcoming due dates, and optional time logging.
Cases can be filtered by support role or by a specific coworker (e.g. "all
cases involving Mrs. Walker"). Support-role and plan-type options live in
**Settings** and can be renamed or added to; a **Team bank** keeps a reusable
roster of everyone you work with.

Data is stored in the browser's `localStorage` by default — it stays on
whichever device and browser you use it in. Nothing is sent to a server
unless you turn on optional cross-device sync (see **Sync setup** below).
The first time it's opened in a browser, it loads with sample data so you
can see how it works; use **Clear all data** in the sidebar to start fresh,
or **Reset sample data** to put the demo data back.

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

## Sync setup (optional)

By default the app is entirely local — nothing changes unless you do this.
Setting it up turns on the **Sync & backup** tab so the same account stays
up to date across every device you sign into it on. It uses
[Firebase](https://firebase.google.com) (Google's app backend), on the free
tier, no credit card required.

1. Go to the [Firebase console](https://console.firebase.google.com), sign
   in with any Google account, and click **Add project**. Give it any name
   (e.g. "caseload"), and you can skip Google Analytics — it isn't needed.
2. Once the project is created, click the **web icon (`</>`)** on the
   project overview page to register a web app. Give it any nickname and
   click **Register app**. You'll see a `firebaseConfig` object — keep this
   page open, you'll copy values from it in a moment.
3. In the left sidebar: **Build → Authentication → Get started**. Click the
   **Email/Password** provider and enable it, then **Save**.
4. In the left sidebar: **Build → Firestore Database → Create database**.
   Choose any location close to you, and start in **production mode**.
5. Still in Firestore, click the **Rules** tab and replace the contents with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   Click **Publish**. This is what keeps everyone's data private to their
   own account — without it, Firestore blocks all access by default.
6. Open `src/firebaseConfig.js` in this project and replace the placeholder
   values with the real ones from step 2 (`apiKey`, `authDomain`,
   `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
7. Commit and push (or rebuild and redeploy). Open the **Sync & backup** tab
   in the app, create an account (any email/password — it doesn't need to be
   a real email address, just something you'll remember), and choose whether
   to upload what's already on that device or start fresh. Sign into the
   same account on any other device to keep them in sync.

## Notes

- With sync off, data lives only in that browser's `localStorage` — using
  the app on a phone and a laptop means two separate, unsynced copies.
- With sync on, case data (student names, plan types, categories, etc.)
  is stored in your own private Firestore database rather than staying
  purely on-device. It isn't public — only someone signed into that exact
  account can read it — but it's a different privacy posture than fully
  local storage, worth being deliberate about.
- The **Download backup** button in **Sync & backup** works regardless of
  whether sync is set up, and is a good habit before trying something new.
- Private browsing / incognito windows usually clear `localStorage` when
  closed — avoid those for real use.
