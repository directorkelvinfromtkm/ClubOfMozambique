/* ------------------------------------------------------------------
 * Google Workspace integration.
 *
 * Three tiers, all optional:
 *  1. Deep links (no setup): Gmail compose, Calendar event template,
 *     Drive folder.  Always available.
 *  2. Apps Script Web App (no GCP project): the CRM posts JSON to a
 *     script bound to a Google Sheet (see apps-script/Code.gs).
 *  3. OAuth sign-in (GCP OAuth Client ID): direct REST calls to
 *     Sheets, Calendar (with Google Meet), Gmail drafts and Drive.
 * ------------------------------------------------------------------ */
(function () {
  const SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ].join(" ");

  let tokenClient = null;
  let accessToken = null;
  let tokenExpiry = 0;
  let profile = null;
  const bus = new Set();

  function emit(evt, payload) { bus.forEach((fn) => fn(evt, payload)); }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement("script");
      s.src = src; s.async = true; s.defer = true;
      s.onload = resolve; s.onerror = () => reject(new Error("Could not load " + src));
      document.head.appendChild(s);
    });
  }

  /* ---------------- Tier 1: deep links ---------------- */
  function pad(n) { return String(n).padStart(2, "0"); }
  function gcalDate(iso) {
    const t = new Date(iso);
    return t.getUTCFullYear() + pad(t.getUTCMonth() + 1) + pad(t.getUTCDate()) + "T" + pad(t.getUTCHours()) + pad(t.getUTCMinutes()) + "00Z";
  }
  const Links = {
    gmail({ to, subject, body, cc }) {
      const p = new URLSearchParams({ view: "cm", fs: "1", to: to || "", su: subject || "", body: body || "" });
      if (cc) p.set("cc", cc);
      return "https://mail.google.com/mail/?" + p.toString();
    },
    calendar({ title, startISO, durationMin, details, guests, location }) {
      const end = new Date(new Date(startISO).getTime() + (durationMin || 30) * 60000).toISOString();
      const p = new URLSearchParams({ action: "TEMPLATE", text: title || "", dates: gcalDate(startISO) + "/" + gcalDate(end), details: details || "" });
      if (guests) p.set("add", guests);
      if (location) p.set("location", location);
      return "https://calendar.google.com/calendar/render?" + p.toString();
    },
    meetNew() { return "https://meet.google.com/new"; },
    sheet(id) { return id ? `https://docs.google.com/spreadsheets/d/${id}/edit` : "https://sheets.new"; },
    driveFolder(url) { return url || "https://drive.google.com/drive/my-drive"; },
    contacts(q) { return "https://contacts.google.com/search/" + encodeURIComponent(q || ""); },
  };

  /* ---------------- Tier 3: OAuth ---------------- */
  async function init(clientId) {
    if (!clientId) throw new Error("Add your Google OAuth Client ID in Settings first.");
    await loadScript("https://accounts.google.com/gsi/client");
    if (!window.google || !google.accounts) throw new Error("Google Identity Services did not load.");
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: () => {},
    });
  }

  function requestToken(prompt) {
    return new Promise((resolve, reject) => {
      tokenClient.callback = (resp) => {
        if (resp.error) return reject(new Error(resp.error_description || resp.error));
        accessToken = resp.access_token;
        tokenExpiry = Date.now() + (Number(resp.expires_in) - 60) * 1000;
        resolve(accessToken);
      };
      tokenClient.requestAccessToken({ prompt: prompt || "" });
    });
  }

  async function ensureToken() {
    if (!tokenClient) await init(Store.settings.clientId);
    if (accessToken && Date.now() < tokenExpiry) return accessToken;
    return requestToken(accessToken ? "" : "consent");
  }

  async function api(url, opts = {}) {
    const token = await ensureToken();
    const headers = Object.assign({ Authorization: "Bearer " + token }, opts.headers || {});
    if (opts.body && typeof opts.body !== "string" && !(opts.body instanceof Blob)) {
      opts.body = JSON.stringify(opts.body);
      headers["Content-Type"] = "application/json";
    }
    const res = await fetch(url, Object.assign({}, opts, { headers }));
    if (res.status === 401) { accessToken = null; throw new Error("Google session expired. Please sign in again."); }
    if (!res.ok) {
      let msg = res.statusText;
      try { const j = await res.json(); msg = (j.error && (j.error.message || j.error)) || msg; } catch (e) { /* ignore */ }
      throw new Error("Google API: " + msg);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  async function signIn() {
    await ensureToken();
    profile = await api("https://www.googleapis.com/oauth2/v3/userinfo");
    emit("signin", profile);
    return profile;
  }
  function signOut() {
    if (accessToken && window.google) google.accounts.oauth2.revoke(accessToken, () => {});
    accessToken = null; profile = null; tokenExpiry = 0;
    emit("signout");
  }
  function isSignedIn() { return !!(accessToken && Date.now() < tokenExpiry); }

  /* ----- Sheets as database ----- */
  const SHEET_TITLES = { contacts: "Contacts", deals: "Deals", tasks: "Tasks", campaigns: "Campaigns", activities: "Activities" };

  function toRows(records) {
    const keys = Array.from(records.reduce((s, r) => { Object.keys(r).forEach((k) => s.add(k)); return s; }, new Set()));
    const rows = [keys];
    records.forEach((r) => rows.push(keys.map((k) => {
      const v = r[k];
      if (v === null || v === undefined) return "";
      return typeof v === "object" ? JSON.stringify(v) : String(v);
    })));
    return rows;
  }
  function fromRows(rows) {
    if (!rows || rows.length < 2) return [];
    const keys = rows[0];
    return rows.slice(1).filter((r) => r.some((c) => c !== "")).map((r) => {
      const o = {};
      keys.forEach((k, i) => {
        let v = r[i] === undefined ? "" : r[i];
        if (v === "true") v = true; else if (v === "false") v = false;
        else if (/^-?\d+(\.\d+)?$/.test(v) && k !== "phone" && k !== "id") v = Number(v);
        else if (typeof v === "string" && (v.startsWith("[") || v.startsWith("{"))) { try { v = JSON.parse(v); } catch (e) { /* keep string */ } }
        o[k] = v === "" ? null : v;
      });
      return o;
    });
  }

  async function createSpreadsheet() {
    const body = {
      properties: { title: "Club of Mozambique CRM" },
      sheets: Object.values(SHEET_TITLES).map((title) => ({ properties: { title } })),
    };
    const ss = await api("https://sheets.googleapis.com/v4/spreadsheets", { method: "POST", body });
    Store.setSettings({ spreadsheetId: ss.spreadsheetId });
    return ss.spreadsheetId;
  }

  async function ensureSheets(id) {
    const meta = await api(`https://sheets.googleapis.com/v4/spreadsheets/${id}?fields=sheets.properties.title`);
    const existing = new Set(meta.sheets.map((s) => s.properties.title));
    const missing = Object.values(SHEET_TITLES).filter((t) => !existing.has(t));
    if (missing.length) {
      await api(`https://sheets.googleapis.com/v4/spreadsheets/${id}:batchUpdate`, {
        method: "POST",
        body: { requests: missing.map((title) => ({ addSheet: { properties: { title } } })) },
      });
    }
  }

  async function pushToSheets() {
    let id = Store.settings.spreadsheetId;
    if (!id) id = await createSpreadsheet();
    await ensureSheets(id);
    const data = Store.COLLECTIONS.map((col) => ({ range: `${SHEET_TITLES[col]}!A1`, values: toRows(Store.list(col)) }));
    // clear then write so removed rows disappear
    await api(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values:batchClear`, {
      method: "POST", body: { ranges: Object.values(SHEET_TITLES).map((t) => `${t}!A:ZZ`) },
    });
    await api(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values:batchUpdate`, {
      method: "POST", body: { valueInputOption: "RAW", data },
    });
    Store.setSettings({ lastSync: new Date().toISOString() });
    emit("synced", { direction: "push" });
    return id;
  }

  async function pullFromSheets() {
    const id = Store.settings.spreadsheetId;
    if (!id) throw new Error("No Spreadsheet ID configured.");
    const ranges = Object.values(SHEET_TITLES).map((t) => encodeURIComponent(`${t}!A:ZZ`)).join("&ranges=");
    const res = await api(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values:batchGet?ranges=${ranges}`);
    const next = {};
    Store.COLLECTIONS.forEach((col, i) => { next[col] = fromRows((res.valueRanges[i] || {}).values); });
    Store.replaceAll(next);
    Store.setSettings({ lastSync: new Date().toISOString() });
    emit("synced", { direction: "pull" });
  }

  /* ----- Calendar + Meet ----- */
  async function createMeeting({ title, startISO, durationMin, description, attendees }) {
    const calId = encodeURIComponent(Store.settings.calendarId || "primary");
    const end = new Date(new Date(startISO).getTime() + (durationMin || 30) * 60000).toISOString();
    const body = {
      summary: title,
      description: description || "",
      start: { dateTime: startISO },
      end: { dateTime: end },
      attendees: (attendees || []).filter(Boolean).map((email) => ({ email })),
      conferenceData: { createRequest: { requestId: "com-" + Math.random().toString(36).slice(2), conferenceSolutionKey: { type: "hangoutsMeet" } } },
      reminders: { useDefault: true },
    };
    const ev = await api(`https://www.googleapis.com/calendar/v3/calendars/${calId}/events?conferenceDataVersion=1&sendUpdates=all`, { method: "POST", body });
    return { id: ev.id, htmlLink: ev.htmlLink, meetLink: ev.hangoutLink || "" };
  }

  async function todaysEvents() {
    const calId = encodeURIComponent(Store.settings.calendarId || "primary");
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const p = new URLSearchParams({ timeMin: start.toISOString(), timeMax: end.toISOString(), singleEvents: "true", orderBy: "startTime", maxResults: "20" });
    const res = await api(`https://www.googleapis.com/calendar/v3/calendars/${calId}/events?${p}`);
    return (res.items || []).map((ev) => ({
      id: ev.id, title: ev.summary || "(no title)",
      start: ev.start.dateTime || ev.start.date, end: ev.end.dateTime || ev.end.date,
      meetLink: ev.hangoutLink || "", htmlLink: ev.htmlLink,
      attendees: (ev.attendees || []).map((a) => a.email),
    }));
  }

  /* ----- Gmail draft ----- */
  function b64url(str) {
    return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  async function createDraft({ to, subject, body, cc }) {
    const raw = [
      `To: ${to}`, cc ? `Cc: ${cc}` : null,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      "Content-Type: text/plain; charset=UTF-8", "", body,
    ].filter((l) => l !== null).join("\r\n");
    const d = await api("https://gmail.googleapis.com/gmail/v1/users/me/drafts", { method: "POST", body: { message: { raw: b64url(raw) } } });
    return { id: d.id, link: "https://mail.google.com/mail/#drafts" };
  }

  /* ----- Drive upload (creatives, signed orders) ----- */
  async function uploadFile(file, name) {
    const meta = { name: name || file.name, mimeType: file.type || "application/octet-stream" };
    const folderId = (Store.settings.driveFolderUrl.match(/folders\/([A-Za-z0-9_-]+)/) || [])[1];
    if (folderId) meta.parents = [folderId];
    const boundary = "com" + Date.now();
    const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: ${meta.mimeType}\r\n\r\n`;
    const blob = new Blob([head, file, `\r\n--${boundary}--`], { type: `multipart/related; boundary=${boundary}` });
    const res = await api("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", { method: "POST", body: blob, headers: { "Content-Type": blob.type } });
    return res;
  }

  /* ---------------- Tier 2: Apps Script backend ---------------- */
  async function scriptCall(action, payload) {
    const url = Store.settings.appsScriptUrl;
    if (!url) throw new Error("Add the Apps Script Web App URL in Settings first.");
    // text/plain avoids a CORS preflight, which Apps Script cannot answer.
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action, payload }) });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error || "Apps Script error");
    return j.data;
  }
  async function scriptPush() {
    const data = {};
    Store.COLLECTIONS.forEach((c) => { data[c] = Store.list(c); });
    await scriptCall("replaceAll", data);
    Store.setSettings({ lastSync: new Date().toISOString() });
    emit("synced", { direction: "push" });
  }
  async function scriptPull() {
    const data = await scriptCall("readAll");
    Store.replaceAll(data);
    Store.setSettings({ lastSync: new Date().toISOString() });
    emit("synced", { direction: "pull" });
  }

  /* ---------------- Unified sync entry points ---------------- */
  async function push() {
    const mode = Store.settings.mode;
    if (mode === "oauth") return pushToSheets();
    if (mode === "appsscript") return scriptPush();
    throw new Error("Choose a Google connection mode in Settings.");
  }
  async function pull() {
    const mode = Store.settings.mode;
    if (mode === "oauth") return pullFromSheets();
    if (mode === "appsscript") return scriptPull();
    throw new Error("Choose a Google connection mode in Settings.");
  }

  window.GoogleWS = {
    Links, init, signIn, signOut, isSignedIn, get profile() { return profile; },
    push, pull, createMeeting, todaysEvents, createDraft, uploadFile, scriptCall,
    on(fn) { bus.add(fn); return () => bus.delete(fn); },
  };
})();
