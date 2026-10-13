/* ------------------------------------------------------------------
 * Store - single source of truth, persisted to localStorage.
 * Google Workspace sync (assets/js/google.js) reads/writes through it.
 * ------------------------------------------------------------------ */
(function () {
  const KEY = "com-crm-v1";
  const SETTINGS_KEY = "com-crm-settings-v1";

  const defaultSettings = {
    mode: "local",              // local | oauth | appsscript
    clientId: "",               // Google OAuth 2.0 Web client ID
    spreadsheetId: "",          // Google Sheet used as the database
    appsScriptUrl: "",          // Apps Script Web App URL (alternative backend)
    driveFolderUrl: "",         // Shared Drive folder for creatives / contracts
    calendarId: "primary",
    vatRate: COM.BRAND.vatRate,
    userName: "Marketing Team",
    userEmail: COM.BRAND.emails.marketing,
    lastSync: null,
  };

  const listeners = new Set();
  let state = load();
  let settings = loadSettings();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore corrupted storage */ }
    return clone(COM.SEED);
  }
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return Object.assign({}, defaultSettings, JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return Object.assign({}, defaultSettings);
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota / private mode */ }
    listeners.forEach((fn) => fn(state));
  }
  function persistSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ }
    listeners.forEach((fn) => fn(state));
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid(prefix) { return prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3); }

  const COLLECTIONS = ["contacts", "deals", "tasks", "campaigns", "activities"];

  const Store = {
    COLLECTIONS,
    get state() { return state; },
    get settings() { return settings; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    list(col) { return state[col] || []; },
    get(col, id) { return (state[col] || []).find((r) => r.id === id) || null; },
    add(col, rec) {
      rec.id = rec.id || uid(col[0]);
      rec.createdAt = rec.createdAt || new Date().toISOString();
      rec.updatedAt = new Date().toISOString();
      state[col] = state[col] || [];
      state[col].unshift(rec);
      persist();
      return rec;
    },
    update(col, id, patch) {
      const rec = Store.get(col, id);
      if (!rec) return null;
      Object.assign(rec, patch, { updatedAt: new Date().toISOString() });
      persist();
      return rec;
    },
    remove(col, id) {
      state[col] = (state[col] || []).filter((r) => r.id !== id);
      if (col === "contacts") {
        state.deals = state.deals.filter((r) => r.contactId !== id);
        state.tasks = state.tasks.filter((r) => r.contactId !== id);
        state.campaigns = state.campaigns.filter((r) => r.contactId !== id);
        state.activities = state.activities.filter((r) => r.contactId !== id);
      }
      if (col === "deals") {
        state.campaigns = state.campaigns.filter((r) => r.dealId !== id);
      }
      persist();
    },
    replaceAll(next) {
      COLLECTIONS.forEach((c) => { if (Array.isArray(next[c])) state[c] = next[c]; });
      persist();
    },
    resetDemo() { state = clone(COM.SEED); persist(); },
    clearAll() { state = { contacts: [], deals: [], tasks: [], campaigns: [], activities: [] }; persist(); },
    exportJSON() { return JSON.stringify({ exportedAt: new Date().toISOString(), settings: { vatRate: settings.vatRate }, ...state }, null, 2); },

    setSettings(patch) { settings = Object.assign({}, settings, patch); persistSettings(); return settings; },

    /* ---------- derived helpers ---------- */
    rate(id) { return COM.RATE_CARD.find((r) => r.id === id); },
    dealValue(deal) {
      const gross = (deal.items || []).reduce((s, it) => {
        const r = Store.rate(it.rateId);
        return s + (r ? r.price * (Number(it.months) || 1) : 0);
      }, 0);
      const disc = Number(deal.discount) || 0;
      return Math.round(gross * (1 - disc / 100));
    },
    contactName(id) { const c = Store.get("contacts", id); return c ? c.name : "Unknown"; },
    contactCompany(id) { const c = Store.get("contacts", id); return c ? c.company : ""; },
    logActivity(contactId, type, text) {
      return Store.add("activities", { contactId, type, text, at: new Date().toISOString() });
    },
    uid,
  };

  window.Store = Store;
})();
