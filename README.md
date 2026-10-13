# Club of Mozambique CRM

A modern, single-page advertising-sales CRM for **Club of Mozambique**
(www.clubofmozambique.com), built in plain HTML, CSS and JavaScript with no
build step, and designed to plug into **Google Workspace** (Sheets, Calendar +
Meet, Gmail, Drive).

Rates, banner specifications, audience figures and contacts come from the
*Club of Mozambique Media Kit (incl. 2026)*; the brand palette (green
`#80b641`, blue `#2aa9e0`, navy `#233b7e`, Poppins) follows the same document.

```
index.html               the app shell
assets/css/app.css       design system and layout
assets/img/              official logo, mark and favicon
assets/js/data.js        rate card, ad specs, media-kit facts, demo seed data
assets/js/store.js       state + localStorage persistence
assets/js/google.js      Google Workspace integration (3 tiers, see below)
assets/js/app.js         views, modals, kanban drag & drop, proposal builder
apps-script/Code.gs      optional Sheets-bound backend (Web App + daily digest)
apps-script/appsscript.json
```

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080     # http://localhost:8080
```

Google sign-in needs an `http://localhost` or `https://` origin, so use the
server (or Google Sites / Firebase Hosting / any static host) rather than
`file://` when you connect Workspace.

## What's inside

| View | What it does |
| --- | --- |
| **Dashboard** | Today's schedule strip, KPIs (open / won / lost deals, pipeline value in MZN), new leads with interest levels, today's tasks, next Google Meet, media-kit summary and monthly goal. |
| **Leads & Clients** | Lead cards + full table, filters by interest (Hot Client → Non interest), search, sort, CSV import (Google Contacts export works) / export, contact detail with deals, campaigns, tasks and an activity log. |
| **Pipeline** | Kanban across New → Contacted → Proposal Sent → Negotiation → Won / Lost. Drag a card to move it; probabilities update and the change is logged. Deal value is computed from rate-card lines × months, minus discount. |
| **Campaigns** | Six-month booking timeline per placement, live/upcoming counts, impressions, clicks, CTR, creative status. Creative files are checked against the exact banner specs (1220×300, 500×430, 500×320, ≤ 4 MB). |
| **Rate Card & Proposals** | The 2026 rate card and specs, free value-added products, and a proposal builder with discount, VAT (default 16 %, editable) and totals. Create a deal from it, email it via Gmail, print to PDF, or copy the text. |
| **Tasks** | Google Meet calls, proposals, invoices, creative collection, follow-ups. Filters for Hot, Due Today, Overdue, Completed. One click adds a task to Google Calendar. |
| **Reports & Media Kit** | Revenue won, win rate, pipeline by stage, revenue by product, leads by source, plus the media-kit audience: 2.4 M active users, 7.8 M pageviews, top countries, gender split, social reach, content sections. |
| **Settings** | Google connection mode, IDs, VAT rate, Drive folder, JSON backup / restore, demo data reset. |

## Google Workspace integration

Three tiers, pick what fits. Everything also works fully offline (data stays
in the browser's localStorage).

### 1 · Deep links — zero setup
Always on. "Email" opens Gmail with the recipient, subject and body filled in.
"Google Calendar" opens a pre-filled event (add Google Meet with one click in
Calendar). Drive opens the configured creatives folder.

### 2 · Apps Script Web App — no Cloud project
Best for a small team that wants one shared Google Sheet as the database.

1. Create a Google Sheet, open **Extensions → Apps Script**.
2. Paste `apps-script/Code.gs` and `apps-script/appsscript.json`.
3. **Deploy → New deployment → Web app**, *Execute as: Me*, *Access: Anyone
   within your domain* (or anyone with the link).
4. In the CRM: **Settings → Apps Script**, paste the `/exec` URL, **Save**, then
   **Push to Google Sheets**. Colleagues paste the same URL and **Pull**.
5. Optionally run `installDailyDigest()` once in the script editor: every
   morning at 07:30 (Africa/Maputo) the team gets today's and overdue tasks by
   email.

### 3 · Google sign-in — full API access
Two-way Sheets sync, Calendar events **with Google Meet links**, Gmail drafts,
Drive uploads of creatives, and today's calendar in the schedule strip.

1. In [Google Cloud Console](https://console.cloud.google.com/) create a
   project (or use the Workspace one) and enable the **Google Sheets API,
   Google Calendar API, Gmail API, Google Drive API**.
2. **APIs & Services → OAuth consent screen**: Internal (Workspace users only).
3. **Credentials → Create credentials → OAuth client ID → Web application**.
   Add the URL where the CRM is hosted (e.g. `http://localhost:8080`) to
   *Authorised JavaScript origins*.
4. In the CRM: **Settings → Google sign-in**, paste the Client ID, **Save**,
   **Sign in with Google**. The first **Push** creates a spreadsheet named
   *Club of Mozambique CRM* (or paste an existing Sheet ID).

Scopes requested: `spreadsheets`, `calendar.events`, `gmail.compose`,
`drive.file`, `userinfo.email`, `userinfo.profile`. Tokens live in memory
only; nothing is sent anywhere except Google's APIs.

## Data model (Sheet tabs)

`Contacts` · `Deals` (items = JSON list of `{rateId, months}`) · `Tasks` ·
`Campaigns` · `Activities`. Every record has `id`, `createdAt`, `updatedAt`.
The first row of each tab is the header; the CRM rewrites the whole tab on
push, so treat the Sheet as the mirror and the CRM as the editor (or edit in
the Sheet and **Pull**).

## Customising

* Rates / specs / audience: `assets/js/data.js` (`COM.RATE_CARD`, `COM.AD_SPECS`, `COM.MEDIA_KIT`).
* Stages, interest levels, task types: same file.
* Colours and spacing: CSS variables at the top of `assets/css/app.css`.
* Monthly sales goal shown in the right panel: `target` in `renderRightPanel()` in `assets/js/app.js`.
