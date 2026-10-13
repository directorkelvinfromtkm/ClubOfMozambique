/* ------------------------------------------------------------------
 * Club of Mozambique CRM - UI
 * Vanilla JS, no build step.  Renders into index.html.
 * ------------------------------------------------------------------ */
(function () {
  "use strict";

  /* ============ helpers ============ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nf = new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 });
  const fmtMZN = (n) => nf.format(Math.round(Number(n) || 0)) + " MZN";
  const fmtNum = (n) => nf.format(Math.round(Number(n) || 0));
  const fmtK = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : n >= 1e3 ? Math.round(n / 1e3) + "K" : String(n));
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
  const fmtDateShort = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
  const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s/g, "").toLowerCase() : "";
  const toLocalInput = (iso) => { if (!iso) return ""; const t = new Date(iso); const p = (n) => String(n).padStart(2, "0"); return `${t.getFullYear()}-${p(t.getMonth() + 1)}-${p(t.getDate())}T${p(t.getHours())}:${p(t.getMinutes())}`; };
  const toLocalDate = (iso) => iso ? toLocalInput(iso).slice(0, 10) : "";
  const isToday = (iso) => { const a = new Date(iso), b = new Date(); return a.toDateString() === b.toDateString(); };
  const startOfDay = (dt) => { const t = new Date(dt); t.setHours(0, 0, 0, 0); return t; };
  const initials = (name) => (name || "?").split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();
  const AV_COLORS = ["#233b7e", "#2aa9e0", "#80b641", "#e5484d", "#f0a020", "#7c5cbf", "#0f9d8a"];
  const avColor = (id) => AV_COLORS[(String(id || "").split("").reduce((s, c) => s + c.charCodeAt(0), 0)) % AV_COLORS.length];
  const avatar = (c, cls) => `<span class="avatar ${cls || ""}" style="background:${avColor(c && c.id)}" title="${esc(c && c.name)}">${esc(initials(c && c.name))}</span>`;
  const interestClass = (i) => ({ "Hot Client": "hot", "Great interest": "great", "Medium interest": "medium", "Low interest": "low", "Non interest": "none" }[i] || "none");
  const interestLevel = (i) => ({ "Hot Client": 5, "Great interest": 4, "Medium interest": 3, "Low interest": 2, "Non interest": 1 }[i] || 0);
  const interestDots = (i) => { const n = interestLevel(i), cls = interestClass(i); let h = '<span class="interest-dots">'; for (let k = 1; k <= 5; k++) h += `<i class="${k <= n ? "on " + cls : ""}"></i>`; return h + "</span>"; };
  const interestChip = (i) => `<span class="chip ${({ hot: "red", great: "green", medium: "amber", low: "blue", none: "" })[interestClass(i)]}"><span class="dot"></span>${esc(i)}</span>`;
  const stageChip = (s) => `<span class="chip ${({ New: "", Contacted: "blue", "Proposal Sent": "navy", Negotiation: "amber", Won: "green", Lost: "red" })[s] || ""}">${esc(s)}</span>`;
  const creativeChip = (s) => `<span class="chip ${({ Approved: "green", Published: "green", Pending: "amber", Rejected: "red" })[s] || ""}">${esc(s)}</span>`;
  const options = (list, sel, labelFn) => list.map((v) => { const val = typeof v === "object" ? v.value : v; const lbl = typeof v === "object" ? v.label : (labelFn ? labelFn(v) : v); return `<option value="${esc(val)}" ${String(val) === String(sel) ? "selected" : ""}>${esc(lbl)}</option>`; }).join("");

  /* ============ icons (feather-style, inline) ============ */
  const I = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    kanban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5" height="18" rx="1.5"/><rect x="10" y="3" width="5" height="12" rx="1.5"/><rect x="17" y="3" width="4" height="8" rx="1.5"/></svg>',
    megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a3 3 0 0 1 0 6"/><path d="M18 6a7 7 0 0 1 0 12"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><circle cx="7" cy="7" r="1.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m1 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>',
    sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    meet: '<svg viewBox="0 0 24 24"><path fill="#00832d" d="M13.5 12l2.7 3.1 3.7 2.3.6-5.4-.6-5.3-3.7 2.1z"/><path fill="#0066da" d="M2 15.6V20c0 1.1.9 2 2 2h4.4l.9-3.3-.9-3.1-3-.9z"/><path fill="#e94235" d="M8.4 2L2 8.4l3.4 1 3-.9.9-3.1z"/><path fill="#2684fc" d="M8.4 8.4H2v7.2h6.4z"/><path fill="#00ac47" d="M22.5 5.2l-2.6 2.2v9.4l2.6 2.1c.4.3 1 0 1-.5V5.7c0-.5-.6-.8-1-.5zM13.5 12v3.6H8.4V22h9.5c1.1 0 2-.9 2-2v-2.6z"/><path fill="#ffba00" d="M17.9 2H8.4v6.4h5.1V12l6.4-5.3V4c0-1.1-.9-2-2-2z"/></svg>',
    gmail: '<svg viewBox="0 0 24 24"><path fill="#4285f4" d="M2 6.5v11c0 .8.7 1.5 1.5 1.5H6V9.3L12 13.8l6-4.5V19h2.5c.8 0 1.5-.7 1.5-1.5v-11L12 12z"/><path fill="#ea4335" d="M22 6.5c0-1.7-2-2.7-3.4-1.7L12 9.7 5.4 4.8C4 3.8 2 4.8 2 6.5L12 14z"/></svg>',
    gcal: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#dadce0"/><path d="M3 8h18V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" fill="#4285f4"/><text x="12" y="17.5" font-size="9" font-weight="700" text-anchor="middle" fill="#1a73e8" font-family="Poppins,sans-serif">31</text></svg>',
    gsheet: '<svg viewBox="0 0 24 24"><path fill="#0f9d58" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path fill="#87ceac" d="M14 2v6h6z"/><path fill="#fff" d="M7 11h10v7H7zm1.5 1.5v1.2h3v-1.2zm4 0v1.2h3v-1.2zm-4 2.2v1.2h3v-1.2zm4 0v1.2h3v-1.2z"/></svg>',
    gdrive: '<svg viewBox="0 0 24 24"><path fill="#0066da" d="M4.4 18.5l1.6 2.8c.3.6.9 1 1.6 1h9c.7 0 1.3-.4 1.6-1l1.6-2.8z"/><path fill="#00ac47" d="M9 4.2L2.3 15.7c-.3.6-.3 1.3 0 1.9l2.1 3.7L11 9.7z"/><path fill="#ffba00" d="M15 4.2c-.3-.6-.9-1-1.6-1h-3.4l6.9 12H23l-.6-1z"/><path fill="#2684fc" d="M4.4 18.5H20l-2-3.3H6.4z" opacity=".95"/><path fill="#ea4335" d="M15 4.2l4.4 7.7 3.3 5.9c.3-.6.3-1.3 0-1.9L15.9 4.2z" opacity=".9"/></svg>',
    google: '<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5H1.2v3.1C3.2 21.3 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.2C.4 8.2 0 10 0 12s.4 3.8 1.2 5.4z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l4 3.1c1-2.9 3.7-5 6.8-5z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  };
  const TASK_ICON = { "Google Meet Call": I.meet, "Phone Call": I.phone, "Send Proposal": I.file, "Send Invoice": I.file, "Collect Creative": I.upload, "Follow-up Email": I.gmail, "Publish Campaign": I.megaphone, "Report": I.chart };

  /* ============ app state ============ */
  const ui = {
    view: (location.hash || "#dashboard").slice(1),
    leadFilter: "All", leadSearch: "", leadSort: "recent",
    taskFilter: "All", taskSearch: "",
    dealSearch: "",
    calendarEvents: null,
    proposal: { contactId: "", lines: [{ rateId: "hp-full", months: 1 }], discount: 0, notes: "" },
  };
  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: I.grid },
    { id: "leads",     label: "Leads & Clients", icon: I.users },
    { id: "pipeline",  label: "Pipeline", icon: I.kanban },
    { id: "campaigns", label: "Campaigns", icon: I.megaphone },
    { id: "ratecard",  label: "Rate Card & Proposals", icon: I.tag },
    { id: "tasks",     label: "Tasks", icon: I.check },
    { id: "reports",   label: "Reports & Media Kit", icon: I.chart },
  ];

  /* ============ toast ============ */
  function toast(msg, kind, linkHtml) {
    const el = document.createElement("div");
    el.className = "toast " + (kind || "");
    el.innerHTML = esc(msg) + (linkHtml || "");
    $("#toast-root").appendChild(el);
    setTimeout(() => el.remove(), linkHtml ? 7000 : 3200);
  }

  /* ============ modal ============ */
  function openModal(html, opts) {
    closeModal();
    const root = $("#modal-root");
    root.innerHTML = `<div class="modal-backdrop" data-action="modal-backdrop"><div class="modal ${opts && opts.wide ? "wide" : ""}" role="dialog" aria-modal="true">${html}</div></div>`;
    const first = root.querySelector("input,select,textarea,button:not([data-action='modal-close'])");
    if (first) setTimeout(() => first.focus(), 30);
  }
  function closeModal() { $("#modal-root").innerHTML = ""; }
  const modalHead = (title) => `<div class="mh"><h3>${title}</h3><button class="icon-btn sm ghost" data-action="modal-close" aria-label="Close">${I.x}</button></div>`;
  function formData(form) {
    const o = {};
    new FormData(form).forEach((v, k) => { o[k] = v; });
    form.querySelectorAll("input[type=checkbox]").forEach((c) => { o[c.name] = c.checked; });
    return o;
  }

  /* ============ rendering ============ */
  function render() {
    const s = Store.settings;
    const app = $("#app");
    app.classList.toggle("no-right", !["dashboard", "leads", "tasks"].includes(ui.view));
    renderSidebar();
    renderTopbar();
    renderView();
    renderRightPanel();
    document.title = (NAV.find((n) => n.id === ui.view) || { label: "Settings" }).label + " · Club of Mozambique CRM";
    void s;
  }

  function renderSidebar() {
    const connected = Store.settings.mode !== "local" && (Store.settings.mode === "appsscript" ? !!Store.settings.appsScriptUrl : GoogleWS.isSignedIn());
    $("#sidebar").innerHTML = `
      <img class="logo-mark" src="assets/img/logo-mark.png" alt="Club of Mozambique" />
      ${NAV.map((n) => `<button class="nav-btn ${ui.view === n.id ? "active" : ""}" data-action="nav" data-view="${n.id}" aria-label="${n.label}">${n.icon}<span class="tip">${n.label}</span></button>`).join("")}
      <div class="spacer"></div>
      <button class="nav-btn google-dot ${connected ? "on" : ""} ${ui.view === "settings" ? "active" : ""}" data-action="nav" data-view="settings" aria-label="Settings & Google Workspace">${I.settings}<span class="tip">Settings & Google Workspace</span></button>`;
  }

  function scheduleItems() {
    // Today's tasks with a time, merged with Google Calendar events when connected.
    const items = Store.list("tasks").filter((t) => !t.done && isToday(t.due)).map((t) => {
      const c = Store.get("contacts", t.contactId);
      return { time: t.due, title: t.type, contact: c, meet: t.type === "Google Meet Call", meetLink: t.meetLink, taskId: t.id };
    });
    (ui.calendarEvents || []).forEach((ev) => {
      if (!items.some((it) => Math.abs(new Date(it.time) - new Date(ev.start)) < 60000)) items.push({ time: ev.start, title: ev.title, meet: !!ev.meetLink, meetLink: ev.meetLink, gcal: true, link: ev.htmlLink });
    });
    return items.sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  function renderTopbar() {
    const s = Store.settings;
    const items = scheduleItems();
    const now = Date.now();
    const overdue = Store.list("tasks").filter((t) => !t.done && new Date(t.due) < startOfDay(new Date())).length;
    const connected = s.mode === "oauth" ? GoogleWS.isSignedIn() : s.mode === "appsscript" ? !!s.appsScriptUrl : false;
    const statusLabel = s.mode === "local" ? "Local only" : s.mode === "appsscript" ? (connected ? "Apps Script linked" : "Apps Script: no URL") : (connected ? (GoogleWS.profile && GoogleWS.profile.email) || "Google connected" : "Google: sign in");
    $("#topbar").innerHTML = `
      <div class="brand"><img class="logo-full" src="assets/img/logo-sm.png" alt="Club of Mozambique by MozParks" /><span class="chip navy">Advertising CRM</span></div>
      <div class="schedule">
        <span class="label">Your Schedule</span>
        <span class="date-pill">${I.cal.replace("<svg", '<svg width="14" height="14"')} ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</span>
        <div class="track">
          ${items.length ? items.slice(0, 5).map((it) => {
            const t = new Date(it.time).getTime();
            const isNow = t <= now + 30 * 60000 && t >= now - 30 * 60000;
            const act = it.meetLink ? `data-action="open-url" data-url="${esc(it.meetLink)}"` : it.taskId ? `data-action="edit-task" data-id="${it.taskId}"` : it.link ? `data-action="open-url" data-url="${esc(it.link)}"` : "";
            return `<button class="slot ${isNow ? "now" : ""} ${it.meet ? "meet" : ""}" ${act} title="${esc(it.title)}">
              ${it.meet ? I.meet.replace("<svg", '<svg width="16" height="16"') : ""}<span class="time">${fmtTime(it.time)}</span>
              <span class="ellipsis" style="max-width:120px">${esc(it.title)}</span>
              ${it.contact ? `<span class="avatars">${avatar(it.contact, "avatar sm")}</span>` : ""}
            </button>`;
          }).join("") : `<span class="empty">Nothing scheduled today. ${s.mode === "oauth" && !connected ? '<a href="#settings" data-action="nav" data-view="settings">Connect Google Calendar</a>' : ""}</span>`}
        </div>
      </div>
      <div class="right">
        <button class="gstatus ${connected ? "on" : ""}" data-action="nav" data-view="settings" title="Google Workspace connection"><span class="dot"></span>${I.google.replace("<svg", '<svg width="14" height="14"')} ${esc(statusLabel)}</button>
        <button class="icon-btn" data-action="nav" data-view="tasks" aria-label="Overdue tasks">${I.bell}${overdue ? `<span class="badge">${overdue}</span>` : ""}</button>
        <span class="avatar sm" title="${esc(s.userName)}" style="background:var(--green)">${esc(initials(s.userName))}</span>
      </div>`;
  }

  function renderView() {
    const v = $("#view");
    const map = { dashboard: viewDashboard, leads: viewLeads, pipeline: viewPipeline, campaigns: viewCampaigns, ratecard: viewRateCard, tasks: viewTasks, reports: viewReports, settings: viewSettings };
    v.innerHTML = (map[ui.view] || viewDashboard)();
  }

  /* ---------- KPIs ---------- */
  function kpis() {
    const deals = Store.list("deals");
    const open = deals.filter((d) => !["Won", "Lost"].includes(d.stage));
    const won = deals.filter((d) => d.stage === "Won");
    const lost = deals.filter((d) => d.stage === "Lost");
    const weekAgo = Date.now() - 7 * 86400000;
    const newThisWeek = (arr) => arr.filter((d) => new Date(d.updatedAt || d.createdAt) > weekAgo).length;
    const pipelineValue = open.reduce((s, d) => s + Store.dealValue(d), 0);
    const wonValue = won.reduce((s, d) => s + Store.dealValue(d), 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const wonThisMonth = won.filter((d) => new Date(d.updatedAt || d.createdAt) >= monthStart).reduce((s, d) => s + Store.dealValue(d), 0);
    return { deals, open, won, lost, newThisWeek, pipelineValue, wonValue, wonThisMonth };
  }
  function kpiHtml(k) {
    return `<div class="kpis">
      <div class="kpi"><span class="num">${k.open.length}</span><span class="lbl">Deals</span>${k.newThisWeek(k.open) ? `<span class="delta">+${k.newThisWeek(k.open)}</span>` : ""}</div>
      <div class="kpi"><span class="num">${k.won.length}</span><span class="lbl">won</span>${k.newThisWeek(k.won) ? `<span class="delta">+${k.newThisWeek(k.won)}</span>` : ""}</div>
      <div class="kpi"><span class="num">${k.lost.length}</span><span class="lbl">lost</span>${k.newThisWeek(k.lost) ? `<span class="delta down">+${k.newThisWeek(k.lost)}</span>` : ""}</div>
      <div class="kpi"><span class="num" style="font-size:22px">${fmtK(k.pipelineValue)}</span><span class="lbl">MZN in pipeline</span></div>
    </div>`;
  }

  /* ---------- Dashboard ---------- */
  function viewDashboard() {
    const k = kpis();
    return `
      <div class="page-head">
        <div><div class="title">CLUB <span class="b">OF</span> <span class="g">MOZAMBIQUE</span></div><div class="subtitle">Advertising sales desk · ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div></div>
        <button class="btn dark" data-action="new-deal">${I.plus} New Deal</button>
        ${kpiHtml(k)}
      </div>
      ${leadsSection(true)}
      ${tasksSection(true)}`;
  }

  /* ---------- Leads ---------- */
  function filteredLeads() {
    const q = ui.leadSearch.trim().toLowerCase();
    let list = Store.list("contacts").filter((c) => ui.leadFilter === "All" || c.interest === ui.leadFilter);
    if (q) list = list.filter((c) => [c.name, c.company, c.title, c.email, c.sector, c.source].join(" ").toLowerCase().includes(q));
    if (ui.leadSort === "recent") list = list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (ui.leadSort === "interest") list = list.slice().sort((a, b) => interestLevel(b.interest) - interestLevel(a.interest));
    if (ui.leadSort === "name") list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }
  function leadCard(c) {
    const deals = Store.list("deals").filter((d) => d.contactId === c.id && !["Lost"].includes(d.stage));
    const value = deals.reduce((s, d) => s + Store.dealValue(d), 0);
    return `<div class="lead-card" data-action="open-contact" data-id="${c.id}">
      <button class="open icon-btn sm ghost" aria-label="Open">${I.arrow}</button>
      ${avatar(c)}
      <div><div class="name">${esc(c.name)}</div><div class="role">${esc(c.title)} at ${esc(c.company)}</div></div>
      <div class="meta">
        <div><div class="k">Source</div><div class="tags"><span class="chip">${esc(c.source)}</span>${c.sector ? `<span class="chip">${esc(c.sector)}</span>` : ""}</div></div>
        <div style="text-align:right"><div class="k">${esc(c.interest)}</div>${interestDots(c.interest)}</div>
      </div>
      ${value ? `<div class="tiny muted">${deals.length} deal${deals.length > 1 ? "s" : ""} · <b style="color:var(--ink)">${fmtMZN(value)}</b></div>` : ""}
    </div>`;
  }
  function leadsSection(compact) {
    const list = filteredLeads();
    const shown = compact ? list.slice(0, 8) : list;
    return `<section class="section">
      <div class="section-head">
        <h2>${compact ? "New Leads" : "Leads"}</h2><span class="count">${list.length} Lead${list.length === 1 ? "" : "s"}</span>
        <div class="tools">
          <label class="search">${I.search}<input type="search" placeholder="Search leads…" value="${esc(ui.leadSearch)}" data-input="lead-search" /></label>
          <select class="btn light sm" data-input="lead-sort" style="padding-right:10px">${options([{ value: "recent", label: "Most recent" }, { value: "interest", label: "By interest" }, { value: "name", label: "By name" }], ui.leadSort)}</select>
          <div class="tabs">${["All"].concat(COM.INTEREST).map((f) => `<button class="${ui.leadFilter === f ? "active" : ""}" data-action="lead-filter" data-f="${esc(f)}">${esc(f)}</button>`).join("")}</div>
          <button class="btn green sm" data-action="new-contact">${I.plus} Add lead</button>
          ${compact ? `<button class="btn light sm" data-action="nav" data-view="leads">View all ${I.arrow}</button>` : ""}
        </div>
      </div>
      ${shown.length ? `<div class="lead-grid">${shown.map(leadCard).join("")}</div>` : `<div class="card empty-state">No leads match. <a href="#" data-action="new-contact">Add the first one</a>.</div>`}
    </section>`;
  }
  function viewLeads() {
    const list = Store.list("contacts");
    const byInterest = COM.INTEREST.map((i) => ({ i, n: list.filter((c) => c.interest === i).length }));
    return `
      <div class="page-head">
        <div><div class="title">Leads <span class="g">&</span> Clients</div><div class="subtitle">${list.length} contacts · ${byInterest.filter((x) => x.n).map((x) => `${x.n} ${x.i.toLowerCase()}`).join(" · ")}</div></div>
        <div class="kpis"><button class="btn light" data-action="export-csv" data-col="contacts">${I.download} Export CSV</button><button class="btn light" data-action="import-csv-prompt">${I.upload} Import CSV</button></div>
      </div>
      ${leadsSection(false)}
      <section class="section">
        <div class="section-head"><h2>All contacts</h2></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Name</th><th>Company</th><th>Sector</th><th>Interest</th><th>Source</th><th>Country</th><th>Email</th><th>Phone</th><th class="num">Open value</th></tr></thead>
          <tbody>${filteredLeads().map((c) => {
            const val = Store.list("deals").filter((d) => d.contactId === c.id && !["Won", "Lost"].includes(d.stage)).reduce((s, d) => s + Store.dealValue(d), 0);
            return `<tr data-action="open-contact" data-id="${c.id}"><td><div class="row">${avatar(c, "sm")}<div><b>${esc(c.name)}</b><div class="tiny muted">${esc(c.title)}</div></div></div></td><td>${esc(c.company)}</td><td>${esc(c.sector || "")}</td><td>${interestChip(c.interest)}</td><td>${esc(c.source)}</td><td>${esc(c.country || "")}</td><td><a href="${GoogleWS.Links.gmail({ to: c.email })}" target="_blank" rel="noopener" data-stop>${esc(c.email)}</a></td><td>${esc(c.phone || "")}</td><td class="num">${val ? fmtMZN(val) : "—"}</td></tr>`;
          }).join("")}</tbody>
        </table></div>
      </section>`;
  }

  /* ---------- Tasks ---------- */
  function filteredTasks() {
    const q = ui.taskSearch.trim().toLowerCase();
    const today = startOfDay(new Date()), tomorrow = new Date(today.getTime() + 86400000);
    let list = Store.list("tasks").slice().sort((a, b) => new Date(a.due) - new Date(b.due));
    if (ui.taskFilter === "Hot") list = list.filter((t) => { const c = Store.get("contacts", t.contactId); return c && c.interest === "Hot Client" && !t.done; });
    if (ui.taskFilter === "Due Today") list = list.filter((t) => !t.done && new Date(t.due) >= today && new Date(t.due) < tomorrow);
    if (ui.taskFilter === "Overdue") list = list.filter((t) => !t.done && new Date(t.due) < today);
    if (ui.taskFilter === "Completed") list = list.filter((t) => t.done);
    if (ui.taskFilter === "All") list = list.filter((t) => !t.done).concat(list.filter((t) => t.done));
    if (q) list = list.filter((t) => [t.type, t.status, Store.contactName(t.contactId), Store.contactCompany(t.contactId)].join(" ").toLowerCase().includes(q));
    return list;
  }
  function taskCard(t, hl) {
    const c = Store.get("contacts", t.contactId) || { name: "Unknown", company: "" };
    const deal = t.dealId ? Store.get("deals", t.dealId) : null;
    const isMeet = t.type === "Google Meet Call";
    const overdue = !t.done && new Date(t.due) < startOfDay(new Date());
    return `<div class="task-card ${hl ? "hl" : ""} ${t.done ? "done" : ""}">
      <div class="who">${avatar(c, "sm")}<div><div class="n">${esc(c.name)}</div><div class="c">${esc(c.title || "")}${c.company ? " at " + esc(c.company) : ""}</div></div></div>
      <div class="actions">
        <button class="icon-btn sm" data-action="edit-task" data-id="${t.id}" aria-label="Edit">${I.edit}</button>
        <button class="icon-btn sm" data-action="open-contact" data-id="${c.id}" aria-label="Open contact">${I.arrow}</button>
      </div>
      <div class="ttl"><span class="gicon">${TASK_ICON[t.type] || I.check}</span>${esc(t.type)}</div>
      <div class="sub">
        ${overdue ? `<span class="chip red">Overdue</span>` : ""}
        ${t.amount ? `<span>Amount <b style="color:var(--ink)">${fmtMZN(t.amount)}</b></span>` : `<span class="row" style="gap:6px">${avatar(c, "xs")}<span>${fmtDate(t.due)} at ${fmtTime(t.due)}</span></span>`}
        ${deal ? `<span class="ellipsis" style="max-width:140px" title="${esc(deal.title)}">· ${esc(deal.title)}</span>` : ""}
      </div>
      <div class="foot">
        <div><div class="lbl">Status</div><label class="status-pill">${isMeet ? I.phone.replace("<svg", '<svg width="13" height="13"') : I.check.replace("<svg", '<svg width="13" height="13"')}<select data-input="task-status" data-id="${t.id}">${options(COM.TASK_STATUS, t.status)}</select></label></div>
        <div class="icons">
          <button class="icon-btn sm" data-action="email-task" data-id="${t.id}" title="Email in Gmail">${I.mail}</button>
          ${isMeet ? `<button class="icon-btn sm dark" data-action="meet-task" data-id="${t.id}" title="${t.meetLink ? "Join Google Meet" : "Schedule in Google Calendar"}">${I.video}</button>` : `<button class="icon-btn sm dark" data-action="calendar-task" data-id="${t.id}" title="Add to Google Calendar">${I.cal}</button>`}
          <button class="icon-btn sm ${t.done ? "green" : ""}" data-action="toggle-task" data-id="${t.id}" title="${t.done ? "Mark as not done" : "Mark done"}">${I.check}</button>
        </div>
      </div>
    </div>`;
  }
  function tasksSection(compact) {
    const list = filteredTasks();
    const shown = compact ? list.slice(0, 6) : list;
    const openCount = Store.list("tasks").filter((t) => !t.done).length;
    return `<section class="section">
      <div class="section-head">
        <h2>${compact ? "Your Day's Tasks" : "Tasks"}</h2><span class="count">${openCount} Task${openCount === 1 ? "" : "s"}</span>
        <div class="tools">
          <label class="search">${I.search}<input type="search" placeholder="Search tasks…" value="${esc(ui.taskSearch)}" data-input="task-search" /></label>
          <div class="tabs">${["All", "Hot", "Due Today", "Overdue", "Completed"].map((f) => `<button class="${ui.taskFilter === f ? "active" : ""}" data-action="task-filter" data-f="${f}">${f === "Hot" ? '<span style="color:var(--red)">●</span> ' : ""}${f}</button>`).join("")}</div>
          <button class="btn green sm" data-action="new-task">${I.plus} New task</button>
          ${compact ? `<button class="btn light sm" data-action="nav" data-view="tasks">View all ${I.arrow}</button>` : ""}
        </div>
      </div>
      ${shown.length ? `<div class="task-grid">${shown.map((t, i) => taskCard(t, i === 0 && !t.done && ui.taskFilter !== "Completed")).join("")}</div>` : `<div class="card empty-state">No tasks here. Enjoy the quiet, or <a href="#" data-action="new-task">add a task</a>.</div>`}
    </section>`;
  }
  function viewTasks() {
    const all = Store.list("tasks");
    const overdue = all.filter((t) => !t.done && new Date(t.due) < startOfDay(new Date())).length;
    return `<div class="page-head"><div><div class="title">Your <span class="g">Tasks</span></div><div class="subtitle">${all.filter((t) => !t.done).length} open · ${overdue} overdue · ${all.filter((t) => t.done).length} completed</div></div>
      <div class="kpis"><button class="btn light" data-action="export-csv" data-col="tasks">${I.download} Export CSV</button></div></div>
      ${tasksSection(false)}`;
  }

  /* ---------- Pipeline (kanban) ---------- */
  function viewPipeline() {
    const k = kpis();
    const q = ui.dealSearch.trim().toLowerCase();
    const deals = Store.list("deals").filter((d) => !q || [d.title, Store.contactName(d.contactId), Store.contactCompany(d.contactId)].join(" ").toLowerCase().includes(q));
    return `
      <div class="page-head">
        <div><div class="title">Sales <span class="g">Pipeline</span></div><div class="subtitle">Drag deals between stages · values exclude VAT</div></div>
        <button class="btn dark" data-action="new-deal">${I.plus} New Deal</button>
        <label class="search">${I.search}<input type="search" placeholder="Search deals…" value="${esc(ui.dealSearch)}" data-input="deal-search" /></label>
        ${kpiHtml(k)}
      </div>
      <div class="kanban">${COM.STAGES.map((stage) => {
        const col = deals.filter((d) => d.stage === stage);
        const sum = col.reduce((s, d) => s + Store.dealValue(d), 0);
        return `<div class="kcol" data-stage="${esc(stage)}">
          <div class="kh"><div>${esc(stage)}<span class="sum">${fmtMZN(sum)}</span></div><span class="n">${col.length}</span></div>
          ${col.map((d) => {
            const c = Store.get("contacts", d.contactId);
            return `<div class="kcard ${d.stage === "Won" ? "won" : d.stage === "Lost" ? "lost" : ""}" draggable="true" data-deal="${d.id}" data-action="open-deal" data-id="${d.id}">
              <div class="t">${esc(d.title)}</div>
              <div class="row" style="gap:8px">${c ? avatar(c, "xs") : ""}<span class="small ellipsis">${esc(c ? c.company : "—")}</span></div>
              <div class="row between"><span class="v">${fmtMZN(Store.dealValue(d))}</span><span class="tiny muted">${d.startDate ? "from " + fmtDateShort(d.startDate) : ""}</span></div>
              <div class="p"><i style="width:${d.probability || 0}%"></i></div>
              <div class="tiny muted">${(d.items || []).map((it) => { const r = Store.rate(it.rateId); return r ? `${r.banner} ×${it.months}` : ""; }).filter(Boolean).join(", ")}</div>
            </div>`;
          }).join("")}
        </div>`;
      }).join("")}</div>`;
  }

  /* ---------- Campaigns (bookings timeline) ---------- */
  function viewCampaigns() {
    const camps = Store.list("campaigns").slice().sort((a, b) => new Date(a.start) - new Date(b.start));
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const MONTHS = 6;
    const last = new Date(first.getFullYear(), first.getMonth() + MONTHS, 1);
    const span = last - first;
    const monthLabels = Array.from({ length: MONTHS }, (_, i) => new Date(first.getFullYear(), first.getMonth() + i, 1).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }));
    const live = camps.filter((c) => new Date(c.start) <= now && new Date(c.end) >= now);
    const upcoming = camps.filter((c) => new Date(c.start) > now);
    const impressions = camps.reduce((s, c) => s + (Number(c.impressions) || 0), 0);
    const clicks = camps.reduce((s, c) => s + (Number(c.clicks) || 0), 0);
    return `
      <div class="page-head">
        <div><div class="title">Campaigns <span class="g">&</span> Bookings</div><div class="subtitle">Banner inventory across ${COM.MEDIA_KIT.sections.length} sections · ${COM.AD_FILE_RULES}</div></div>
        <button class="btn dark" data-action="new-campaign">${I.plus} Book campaign</button>
        <div class="kpis">
          <div class="kpi"><span class="num">${live.length}</span><span class="lbl">live</span></div>
          <div class="kpi"><span class="num">${upcoming.length}</span><span class="lbl">upcoming</span></div>
          <div class="kpi"><span class="num" style="font-size:22px">${fmtK(impressions)}</span><span class="lbl">impressions</span></div>
          <div class="kpi"><span class="num" style="font-size:22px">${impressions ? (clicks / impressions * 100).toFixed(2) + "%" : "—"}</span><span class="lbl">CTR</span></div>
        </div>
      </div>
      <section class="section">
        <div class="timeline" style="--months:${MONTHS}">
          <div class="cell head">Placement / client</div>
          <div class="months">${monthLabels.map((m) => `<div class="m">${m}</div>`).join("")}</div>
          ${camps.length ? camps.map((c) => {
            const r = Store.rate(c.rateId) || { banner: "?", section: "" };
            const ct = Store.get("contacts", c.contactId);
            const s = Math.max(0, (new Date(c.start) - first) / span), e = Math.min(1, (new Date(c.end) - first) / span);
            const cls = new Date(c.end) < now ? "past" : new Date(c.start) > now ? "pending" : "";
            const todayPct = (now - first) / span * 100;
            return `<div class="cell"><div class="stack" style="gap:2px;min-width:0"><b class="ellipsis">${esc(r.section)} · ${esc(r.banner)}</b><span class="tiny muted ellipsis">${esc(ct ? ct.company : "—")} · ${creativeChip(c.creative)}</span></div></div>
              <div class="lane"><span class="today" style="left:${todayPct}%"></span>${e > 0 && s < 1 ? `<div class="bar ${cls}" style="left:${s * 100}%;width:${Math.max(3, (e - s) * 100)}%" data-action="edit-campaign" data-id="${c.id}">${esc(ct ? ct.company : "")} · ${fmtDateShort(c.start)} – ${fmtDateShort(c.end)}</div>` : ""}</div>`;
          }).join("") : `<div class="cell" style="grid-column:1/-1;justify-content:center;color:var(--muted)">No campaigns booked yet.</div>`}
        </div>
      </section>
      <section class="section">
        <div class="section-head"><h2>All bookings</h2><div class="tools"><button class="btn light sm" data-action="export-csv" data-col="campaigns">${I.download} Export CSV</button></div></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Client</th><th>Placement</th><th>Spec</th><th>Start</th><th>End</th><th>Creative</th><th>File</th><th class="num">Impressions</th><th class="num">Clicks</th><th class="num">CTR</th><th class="num">Monthly rate</th></tr></thead>
          <tbody>${camps.map((c) => { const r = Store.rate(c.rateId) || {}; const ct = Store.get("contacts", c.contactId); return `<tr data-action="edit-campaign" data-id="${c.id}"><td><b>${esc(ct ? ct.company : "—")}</b></td><td>${esc(r.section || "")} · ${esc(r.banner || "")}</td><td class="muted">${esc(r.spec || "")}</td><td>${fmtDate(c.start)}</td><td>${fmtDate(c.end)}</td><td>${creativeChip(c.creative)}</td><td class="muted">${c.fileLink ? `<a href="${esc(c.fileLink)}" target="_blank" rel="noopener" data-stop>${esc(c.file || "Drive file")}</a>` : esc(c.file || "—")}</td><td class="num">${fmtNum(c.impressions)}</td><td class="num">${fmtNum(c.clicks)}</td><td class="num">${c.impressions ? (c.clicks / c.impressions * 100).toFixed(2) + "%" : "—"}</td><td class="num">${r.price ? fmtMZN(r.price) : "—"}</td></tr>`; }).join("")}</tbody>
        </table></div>
      </section>`;
  }

  /* ---------- Rate card & proposal builder ---------- */
  function proposalTotals(p) {
    const lines = p.lines.map((l) => { const r = Store.rate(l.rateId); return { r, months: Number(l.months) || 1, total: r ? r.price * (Number(l.months) || 1) : 0 }; });
    const subtotal = lines.reduce((s, l) => s + l.total, 0);
    const discount = Math.round(subtotal * (Number(p.discount) || 0) / 100);
    const net = subtotal - discount;
    const vat = Math.round(net * (Number(Store.settings.vatRate) || 0));
    return { lines, subtotal, discount, net, vat, total: net + vat };
  }
  function viewRateCard() {
    const p = ui.proposal;
    const t = proposalTotals(p);
    const contacts = Store.list("contacts");
    return `
      <div class="page-head">
        <div><div class="title">Rate Card <span class="g">&</span> Proposals</div><div class="subtitle">Media Kit 2026 · prices per month in MZN, excl. VAT (${Math.round(Store.settings.vatRate * 100)}% applied in proposals)</div></div>
        <div class="kpis"><a class="btn light" href="mailto:${COM.BRAND.emails.marketing}">${I.mail} ${COM.BRAND.emails.marketing}</a></div>
      </div>
      <div class="two-col">
        <div class="stack" style="gap:16px">
          <div class="table-wrap rate-table"><table>
            <thead><tr><th>Section</th><th>Banner type</th><th>Specification</th><th class="num">Price / month</th><th></th></tr></thead>
            <tbody>${COM.RATE_CARD.map((r) => `<tr><td><b>${esc(r.section)}</b></td><td>${esc(r.banner)}</td><td class="spec">${esc(r.spec)}</td><td class="num"><b>${fmtMZN(r.price)}</b></td><td><button class="btn xs light" data-action="prop-add" data-rate="${r.id}">${I.plus} Add</button></td></tr>`).join("")}</tbody>
          </table></div>
          <div class="card">
            <div class="section-head" style="margin-bottom:10px"><h2 style="font-size:15px">Banner specifications</h2><span class="tiny muted">${COM.AD_FILE_RULES}</span></div>
            <div class="spec-grid">${COM.AD_SPECS.map((s) => { const scale = 150 / 1220; return `<div class="spec-box"><div class="shape" style="width:${Math.max(40, s.w * scale)}px;height:${Math.max(12, s.h * scale)}px"></div><b>${esc(s.name)}</b><span>${s.w} × ${s.h} px</span></div>`; }).join("")}</div>
          </div>
          <div class="card">
            <div class="section-head" style="margin-bottom:8px"><h2 style="font-size:15px">Free of charge (value added)</h2></div>
            <div class="mini-list">${COM.FREE_PRODUCTS.map((f) => `<div class="item"><div><b>${esc(f.name)}</b><div class="tiny muted">${esc(f.format)}</div></div><a class="btn xs light" href="${GoogleWS.Links.gmail({ to: f.contact, subject: f.name + " submission" })}" target="_blank" rel="noopener">${I.mail} ${esc(f.contact)}</a></div>`).join("")}</div>
            <p class="tiny muted" style="margin:10px 0 0">Editorial policy: advertising and sponsored content never influence editorial decisions. Opinion articles and advertorials are clearly identified. Club of Mozambique may refuse content that does not meet its guidelines.</p>
          </div>
        </div>
        <div class="card" id="proposal">
          <div class="section-head" style="margin-bottom:10px"><h2 style="font-size:16px">Proposal builder</h2><span class="tiny muted">Rates from the Media Kit</span></div>
          <div class="field"><label>Client</label><select data-input="prop-contact">${options([{ value: "", label: "— choose a lead —" }].concat(contacts.map((c) => ({ value: c.id, label: `${c.company} — ${c.name}` }))), p.contactId)}</select></div>
          <div class="proposal-lines" style="margin-top:10px">
            <div class="line tiny muted" style="border-bottom:0;padding-bottom:0"><span>Placement</span><span>Months</span><span style="text-align:right">Line total</span><span></span></div>
            ${p.lines.map((l, i) => { const r = Store.rate(l.rateId); return `<div class="line">
              <select data-input="prop-rate" data-i="${i}">${options(COM.RATE_CARD.map((x) => ({ value: x.id, label: `${x.section} · ${x.banner}` })), l.rateId)}</select>
              <input type="number" min="1" max="24" value="${Number(l.months) || 1}" data-input="prop-months" data-i="${i}" />
              <span class="num mono" style="text-align:right;font-weight:600">${fmtMZN(r ? r.price * (Number(l.months) || 1) : 0)}</span>
              <button class="icon-btn sm ghost" data-action="prop-remove" data-i="${i}" aria-label="Remove">${I.x}</button>
            </div>`; }).join("")}
          </div>
          <div class="row" style="margin-top:10px;gap:8px"><button class="btn light sm" data-action="prop-add" data-rate="hp-full">${I.plus} Add line</button>
            <label class="field grow" style="flex-direction:row;align-items:center;gap:8px"><span class="tiny muted" style="text-transform:none;letter-spacing:0">Discount %</span><input type="number" min="0" max="100" style="width:80px" value="${Number(p.discount) || 0}" data-input="prop-discount" /></label></div>
          <div class="totals">
            <div class="t"><span>Subtotal</span><span class="mono">${fmtMZN(t.subtotal)}</span></div>
            ${t.discount ? `<div class="t" style="color:var(--green-dark)"><span>Discount (${p.discount}%)</span><span class="mono">− ${fmtMZN(t.discount)}</span></div>` : ""}
            <div class="t"><span>VAT (${Math.round(Store.settings.vatRate * 100)}%)</span><span class="mono">${fmtMZN(t.vat)}</span></div>
            <div class="t grand"><span>Total</span><span class="mono">${fmtMZN(t.total)}</span></div>
          </div>
          <div class="field" style="margin-top:10px"><label>Notes for the client</label><textarea data-input="prop-notes" placeholder="Campaign dates, creative deadlines, payment terms…">${esc(p.notes)}</textarea></div>
          <div class="row wrap" style="margin-top:12px;gap:8px">
            <button class="btn dark" data-action="prop-create-deal" ${p.contactId ? "" : "disabled"}>${I.kanban} Create deal</button>
            <button class="btn light" data-action="prop-email" ${p.contactId ? "" : "disabled"}>${I.gmail} Email via Gmail</button>
            <button class="btn light" data-action="prop-print">${I.print} Print / PDF</button>
            <button class="btn light" data-action="prop-copy">${I.copy} Copy text</button>
          </div>
          <p class="tiny muted" style="margin:12px 0 0">All advertising must be supported by a payment guarantee or settled on submission of the order. Contracts are subject to the General Terms and Conditions for Advertising of Club of Mozambique.</p>
        </div>
      </div>`;
  }
  function proposalText(p) {
    const c = Store.get("contacts", p.contactId);
    const t = proposalTotals(p);
    const lines = [
      `CLUB OF MOZAMBIQUE — ADVERTISING PROPOSAL`, `${COM.BRAND.site} · ${COM.BRAND.emails.marketing}`, ``,
      `Prepared for: ${c ? `${c.name}, ${c.title} — ${c.company}` : "—"}`, `Date: ${fmtDate(new Date().toISOString())}`, ``,
      `PLACEMENTS`,
      ...t.lines.map((l) => `• ${l.r.section} · ${l.r.banner} (${l.r.spec}) — ${l.months} month${l.months > 1 ? "s" : ""} × ${fmtMZN(l.r.price)} = ${fmtMZN(l.total)}`),
      ``, `Subtotal: ${fmtMZN(t.subtotal)}`,
      t.discount ? `Discount (${p.discount}%): -${fmtMZN(t.discount)}` : null,
      `VAT (${Math.round(Store.settings.vatRate * 100)}%): ${fmtMZN(t.vat)}`, `TOTAL: ${fmtMZN(t.total)}`, ``,
      p.notes ? `Notes: ${p.notes}\n` : null,
      `Audience: ${fmtNum(COM.MEDIA_KIT.activeUsers)} active users and ${fmtNum(COM.MEDIA_KIT.pageviews)} pageviews (${COM.MEDIA_KIT.period}). Social reach: ${COM.MEDIA_KIT.social.map((s) => `${s.name} ${fmtK(s.followers)}`).join(", ")}.`, ``,
      `Prices in Meticais (MZN), exclusive of VAT. Advertising must be supported by a payment guarantee or settled upon submission of the order. Subject to the General Terms and Conditions for Advertising and the Advertising Policy of Club of Mozambique.`,
    ].filter((l) => l !== null);
    return lines.join("\n");
  }

  /* ---------- Reports ---------- */
  function viewReports() {
    const k = kpis();
    const mk = COM.MEDIA_KIT;
    const stageCounts = COM.STAGES.map((s) => ({ s, n: k.deals.filter((d) => d.stage === s).length, v: k.deals.filter((d) => d.stage === s).reduce((x, d) => x + Store.dealValue(d), 0) }));
    const maxStage = Math.max(1, ...stageCounts.map((x) => x.n));
    const bySource = COM.SOURCES.map((s) => ({ s, n: Store.list("contacts").filter((c) => c.source === s).length })).filter((x) => x.n).sort((a, b) => b.n - a.n);
    const byProduct = COM.RATE_CARD.map((r) => ({ r, v: k.won.reduce((s, d) => s + (d.items || []).filter((it) => it.rateId === r.id).reduce((x, it) => x + r.price * (Number(it.months) || 1), 0), 0) })).sort((a, b) => b.v - a.v);
    const maxProd = Math.max(1, ...byProduct.map((x) => x.v));
    const winRate = (k.won.length + k.lost.length) ? Math.round(k.won.length / (k.won.length + k.lost.length) * 100) : 0;
    return `
      <div class="page-head"><div><div class="title">Reports <span class="g">&</span> Media Kit</div><div class="subtitle">Sales performance and the audience numbers your team quotes to advertisers</div></div>
        <div class="kpis"><button class="btn light" data-action="export-json">${I.download} Export all data (JSON)</button></div></div>
      <section class="section">
        <div class="stat-tiles">
          <div class="stat-tile green"><div class="k">Revenue won</div><div class="v">${fmtK(k.wonValue)}</div><div class="s">MZN excl. VAT · all time</div></div>
          <div class="stat-tile"><div class="k">Won this month</div><div class="v">${fmtK(k.wonThisMonth)}</div><div class="s">MZN excl. VAT</div></div>
          <div class="stat-tile"><div class="k">Open pipeline</div><div class="v">${fmtK(k.pipelineValue)}</div><div class="s">${k.open.length} open deals</div></div>
          <div class="stat-tile"><div class="k">Win rate</div><div class="v">${winRate}%</div><div class="s">${k.won.length} won / ${k.lost.length} lost</div></div>
          <div class="stat-tile dark"><div class="k">Avg deal (won)</div><div class="v">${k.won.length ? fmtK(k.wonValue / k.won.length) : "—"}</div><div class="s">MZN</div></div>
        </div>
      </section>
      <div class="two-col">
        <div class="stack" style="gap:16px">
          <div class="card"><div class="section-head" style="margin-bottom:12px"><h2 style="font-size:15px">Pipeline by stage</h2></div>
            <div class="funnel">${stageCounts.map((x) => `<div class="f"><b>${x.n}</b><i style="height:${Math.max(6, x.n / maxStage * 90)}px"></i><span class="tiny muted">${esc(x.s)}</span><span class="tiny">${fmtK(x.v)}</span></div>`).join("")}</div></div>
          <div class="card"><div class="section-head" style="margin-bottom:8px"><h2 style="font-size:15px">Revenue by product (won)</h2></div>
            ${byProduct.map((x) => `<div class="hbar"><span class="ellipsis" title="${esc(x.r.section + " · " + x.r.banner)}">${esc(x.r.section)} · ${esc(x.r.banner)}</span><div class="bar"><i style="width:${x.v / maxProd * 100}%"></i></div><span class="v">${fmtK(x.v)}</span></div>`).join("")}</div>
          <div class="card"><div class="section-head" style="margin-bottom:8px"><h2 style="font-size:15px">Leads by source</h2></div>
            ${bySource.length ? bySource.map((x) => `<div class="hbar"><span>${esc(x.s)}</span><div class="bar"><i class="blue" style="width:${x.n / bySource[0].n * 100}%"></i></div><span class="v">${x.n}</span></div>`).join("") : '<div class="muted small">No leads yet.</div>'}</div>
        </div>
        <div class="stack" style="gap:16px">
          <div class="card dark">
            <div class="row between"><h2 style="font-size:15px">Media Kit · Audience</h2><span class="tiny" style="opacity:.6">${esc(mk.period)}</span></div>
            <div class="stat-tiles" style="grid-template-columns:1fr 1fr;margin-top:12px">
              <div class="stat-tile" style="background:var(--dark-2);box-shadow:none"><div class="k" style="color:rgba(255,255,255,.6)">Active users</div><div class="v" style="color:#fff">${fmtK(mk.activeUsers)}</div></div>
              <div class="stat-tile" style="background:var(--dark-2);box-shadow:none"><div class="k" style="color:rgba(255,255,255,.6)">Pageviews</div><div class="v" style="color:#fff">${fmtK(mk.pageviews)}</div></div>
            </div>
            <div class="divider" style="background:rgba(255,255,255,.08)"></div>
            <div class="tiny" style="opacity:.6;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Top countries by readership</div>
            ${mk.countries.map((c) => `<div class="hbar" style="color:#fff"><span>${esc(c.name)}</span><div class="bar" style="background:rgba(255,255,255,.1)"><i style="width:${c.pct / mk.countries[0].pct * 100}%"></i></div><span class="v" style="color:#fff">${c.pct}%</span></div>`).join("")}
            <div class="divider" style="background:rgba(255,255,255,.08)"></div>
            <div class="tiny" style="opacity:.6;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Gender</div>
            <div class="hbar" style="color:#fff"><span>Male</span><div class="bar" style="background:rgba(255,255,255,.1)"><i class="blue" style="width:${mk.gender.male}%"></i></div><span class="v" style="color:#fff">${mk.gender.male}%</span></div>
            <div class="hbar" style="color:#fff"><span>Female</span><div class="bar" style="background:rgba(255,255,255,.1)"><i style="width:${mk.gender.female}%"></i></div><span class="v" style="color:#fff">${mk.gender.female}%</span></div>
          </div>
          <div class="card"><div class="section-head" style="margin-bottom:8px"><h2 style="font-size:15px">Social media reach</h2><span class="tiny muted">January 2026</span></div>
            ${mk.social.map((s) => `<div class="hbar"><span>${esc(s.name)}</span><div class="bar"><i class="navy" style="width:${s.followers / mk.social[0].followers * 100}%"></i></div><span class="v">${fmtK(s.followers)}</span></div>`).join("")}
            <div class="tiny muted" style="margin-top:8px">Total followers: <b>${fmtNum(mk.social.reduce((a, b) => a + b.followers, 0))}</b>. Opinion articles are reposted on all platforms with direct links.</div></div>
          <div class="card"><div class="section-head" style="margin-bottom:8px"><h2 style="font-size:15px">Content sections</h2></div><div class="row wrap" style="gap:6px">${mk.sections.map((s) => `<span class="chip navy">${esc(s)}</span>`).join("")}</div>
            <p class="tiny muted" style="margin:10px 0 0">Business & Economy (Business, Agriculture, Mining & Energy, Property, Tourism) · Politics & Society (Environment, Politics, Social Development, Society, Sports, Culture) · International (Africa, CPLP, SADC, World) · What's On (events).</p></div>
        </div>
      </div>`;
  }

  /* ---------- Settings ---------- */
  function viewSettings() {
    const s = Store.settings;
    const signed = GoogleWS.isSignedIn();
    return `
      <div class="page-head"><div><div class="title">Settings <span class="g">&</span> Google Workspace</div><div class="subtitle">Data lives in this browser until you connect it to your Workspace. Then Google Sheets becomes the shared database.</div></div>
        <div class="kpis">${s.lastSync ? `<span class="chip green">Last sync ${new Date(s.lastSync).toLocaleString("en-GB")}</span>` : `<span class="chip">Never synced</span>`}</div></div>
      <div class="settings-grid">
        <div class="card">
          <h2 style="font-size:16px;margin-bottom:10px">1 · Connection mode</h2>
          <div class="mode-cards">
            <div class="mode-card ${s.mode === "local" ? "active" : ""}" data-action="set-mode" data-mode="local"><b>Local only</b>Everything stays in this browser. Gmail, Calendar and Drive still open as pre-filled links.</div>
            <div class="mode-card ${s.mode === "oauth" ? "active" : ""}" data-action="set-mode" data-mode="oauth"><b>Google sign-in</b>Sign in with your @clubofmozambique.com account. Two-way sync with Google Sheets, Meet links, Gmail drafts, Drive uploads.</div>
            <div class="mode-card ${s.mode === "appsscript" ? "active" : ""}" data-action="set-mode" data-mode="appsscript"><b>Apps Script</b>No Cloud project needed. A script bound to a Google Sheet stores the data and can email daily digests.</div>
          </div>
          <form data-form="settings" class="form-grid" style="margin-top:16px">
            ${s.mode === "oauth" ? `<div class="field full"><label>Google OAuth Client ID</label><input name="clientId" value="${esc(s.clientId)}" placeholder="1234567890-abc.apps.googleusercontent.com" /><span class="hint">Google Cloud Console → APIs & Services → Credentials → OAuth client (Web). Add this page's origin to Authorised JavaScript origins. Enable the Sheets, Calendar, Gmail and Drive APIs.</span></div>
            <div class="field full"><label>Google Sheet ID (database)</label><input name="spreadsheetId" value="${esc(s.spreadsheetId)}" placeholder="leave empty to create a new sheet on first sync" /><span class="hint">From the sheet URL: docs.google.com/spreadsheets/d/<b>ID</b>/edit</span></div>
            <div class="field"><label>Calendar ID</label><input name="calendarId" value="${esc(s.calendarId)}" placeholder="primary or shared calendar address" /></div>` : ""}
            ${s.mode === "appsscript" ? `<div class="field full"><label>Apps Script Web App URL</label><input name="appsScriptUrl" value="${esc(s.appsScriptUrl)}" placeholder="https://script.google.com/macros/s/…/exec" /><span class="hint">Deploy <code>apps-script/Code.gs</code> as a Web App (Execute as: me · Access: anyone in the organisation, or anyone with the link).</span></div>` : ""}
            <div class="field"><label>Drive folder for creatives</label><input name="driveFolderUrl" value="${esc(s.driveFolderUrl)}" placeholder="https://drive.google.com/drive/folders/…" /></div>
            <div class="field"><label>VAT rate</label><input name="vatRate" type="number" step="0.01" min="0" max="1" value="${s.vatRate}" /><span class="hint">0.16 = 16%. Media Kit: VAT added at the applicable legal rate.</span></div>
            <div class="field"><label>Your name</label><input name="userName" value="${esc(s.userName)}" /></div>
            <div class="field"><label>Your email</label><input name="userEmail" type="email" value="${esc(s.userEmail)}" /></div>
            <div class="full row wrap" style="gap:8px;margin-top:4px">
              <button class="btn dark" type="submit">Save settings</button>
              ${s.mode === "oauth" ? (signed ? `<button class="btn light" type="button" data-action="g-signout">${I.google} Sign out ${GoogleWS.profile ? "(" + esc(GoogleWS.profile.email) + ")" : ""}</button>` : `<button class="btn light" type="button" data-action="g-signin">${I.google} Sign in with Google</button>`) : ""}
              ${s.mode !== "local" ? `<button class="btn green" type="button" data-action="g-push">${I.upload} Push to Google Sheets</button><button class="btn light" type="button" data-action="g-pull">${I.download} Pull from Google Sheets</button>` : ""}
              ${s.mode === "oauth" && signed ? `<button class="btn light" type="button" data-action="g-refresh-cal">${I.gcal} Load today's calendar</button>` : ""}
              ${s.spreadsheetId ? `<a class="btn light" href="${GoogleWS.Links.sheet(s.spreadsheetId)}" target="_blank" rel="noopener">${I.gsheet} Open sheet</a>` : ""}
            </div>
          </form>
        </div>
        <div class="stack" style="gap:16px">
          <div class="card">
            <h2 style="font-size:16px;margin-bottom:6px">2 · What connects where</h2>
            <div class="mini-list">
              <div class="item"><div class="row">${I.gsheet.replace("<svg", '<svg width="20" height="20"')}<div><b>Google Sheets</b><div class="tiny muted">Database: Contacts, Deals, Tasks, Campaigns, Activities tabs</div></div></div><span class="chip ${s.mode !== "local" ? "green" : ""}">${s.mode !== "local" ? "on" : "off"}</span></div>
              <div class="item"><div class="row">${I.gcal.replace("<svg", '<svg width="20" height="20"')}<div><b>Google Calendar + Meet</b><div class="tiny muted">Tasks become events; Meet calls get a Meet link automatically</div></div></div><span class="chip ${s.mode === "oauth" ? "green" : "blue"}">${s.mode === "oauth" ? "API" : "links"}</span></div>
              <div class="item"><div class="row">${I.gmail.replace("<svg", '<svg width="20" height="20"')}<div><b>Gmail</b><div class="tiny muted">Proposals and follow-ups open pre-filled in Gmail, or saved as drafts</div></div></div><span class="chip ${s.mode === "oauth" ? "green" : "blue"}">${s.mode === "oauth" ? "drafts" : "links"}</span></div>
              <div class="item"><div class="row">${I.gdrive.replace("<svg", '<svg width="20" height="20"')}<div><b>Google Drive</b><div class="tiny muted">Creatives (1220×300, 500×430, 500×320) and signed orders</div></div></div><span class="chip ${s.mode === "oauth" ? "green" : "blue"}">${s.mode === "oauth" ? "upload" : "folder"}</span></div>
            </div>
          </div>
          <div class="card">
            <h2 style="font-size:16px;margin-bottom:6px">3 · Data</h2>
            <div class="row wrap" style="gap:8px">
              <button class="btn light sm" data-action="export-json">${I.download} Export JSON</button>
              <label class="btn light sm" style="cursor:pointer">${I.upload} Import JSON<input type="file" accept="application/json" hidden data-input="import-json" /></label>
              <button class="btn light sm" data-action="reset-demo">Reset demo data</button>
              <button class="btn danger sm" data-action="clear-all">${I.trash} Delete all data</button>
            </div>
            <p class="tiny muted" style="margin:10px 0 0">${Store.list("contacts").length} contacts · ${Store.list("deals").length} deals · ${Store.list("tasks").length} tasks · ${Store.list("campaigns").length} campaigns stored locally.</p>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Right panel ---------- */
  function renderRightPanel() {
    const panel = $("#rightpanel");
    if ($("#app").classList.contains("no-right")) { panel.innerHTML = ""; return; }
    const next = scheduleItems().filter((it) => new Date(it.time) > Date.now() - 30 * 60000)[0] || scheduleItems()[0];
    const c = next && next.contact;
    const mk = COM.MEDIA_KIT;
    const k = kpis();
    const target = 500000; // monthly target, editable idea
    const pct = Math.min(100, Math.round(k.wonThisMonth / target * 100));
    const hot = Store.list("contacts").filter((x) => x.interest === "Hot Client").length;
    panel.innerHTML = `
      <div class="meeting-card">
        <div class="top"><span class="chip dark" style="background:rgba(255,255,255,.12)">${I.meet.replace("<svg", '<svg width="14" height="14"')} ${next ? "Next: " + fmtTime(next.time) : "No meeting today"}</span>
          <button class="icon-btn sm" style="background:rgba(255,255,255,.12);border-color:transparent;color:#fff" data-action="new-task" title="Schedule a call">${I.plus}</button></div>
        ${c ? `${avatar(c, "lg")}<div class="n">${esc(c.name)}</div><div class="c">${esc(c.title)} · ${esc(c.company)}</div>` : `<div class="n">${next ? esc(next.title) : "Your afternoon is free"}</div><div class="c">${next ? "Google Calendar event" : "Schedule a Google Meet with a hot lead"}</div>`}
        <div class="controls">
          <button class="icon-btn join" data-action="${next && next.meetLink ? "open-url" : next && next.taskId ? "meet-task" : "open-url"}" data-url="${esc(next && next.meetLink ? next.meetLink : GoogleWS.Links.meetNew())}" data-id="${next && next.taskId ? next.taskId : ""}">${I.video} ${next && next.meetLink ? "Join Meet" : next && next.taskId ? "Schedule Meet" : "New Meet"}</button>
          ${c ? `<button class="icon-btn" data-action="email-contact" data-id="${c.id}" title="Email">${I.mail}</button><a class="icon-btn" href="tel:${esc(c.phone || "")}" title="Call">${I.phone}</a>` : ""}
        </div>
      </div>
      <div class="summary-card">
        <h3><span class="icon-btn sm">${I.chart}</span>Summary <button class="icon-btn sm ghost" style="margin-left:auto;color:#fff" data-action="nav" data-view="reports" aria-label="Open reports">${I.arrow}</button></h3>
        <div class="sec"><div class="k">Media kit documents</div>
          <div class="docs">
            <div class="doc" data-action="nav" data-view="ratecard"><div class="lines"><i></i><i></i><i></i><i></i></div><b>Rate card 2026</b></div>
            <div class="doc" data-action="nav" data-view="reports"><div class="lines"><i></i><i></i><i></i><i></i></div><b>Audience & reach</b></div>
          </div></div>
        <div class="sec"><div class="k">Audience (${esc(mk.period)})</div>
          <div class="stat"><span>Active users</span><b>${fmtK(mk.activeUsers)}</b></div>
          <div class="stat"><span>Pageviews</span><b>${fmtK(mk.pageviews)}</b></div>
          <div class="stat"><span>Social followers</span><b>${fmtK(mk.social.reduce((a, b) => a + b.followers, 0))}</b></div></div>
        <div class="sec"><div class="k">Goal · this month</div>
          <div class="stat"><span>Won ${fmtK(k.wonThisMonth)} of ${fmtK(target)} MZN</span><b>${pct}%</b></div>
          <div class="bar"><i style="width:${pct}%"></i></div>
          <p class="goal" style="margin:10px 0 0">Convert <b>${hot} hot lead${hot === 1 ? "" : "s"}</b> and <em>${k.open.filter((d) => d.stage === "Negotiation").length} in negotiation</em> before month end. Pipeline covers <b>${target ? Math.round(k.pipelineValue / target * 100) : 0}%</b> of target.</p></div>
      </div>`;
  }

  /* ============ modals: contact ============ */
  function contactForm(c) {
    c = c || {};
    openModal(`${modalHead(c.id ? "Edit lead" : "Add lead")}
      <form data-form="contact" class="mb form-grid">
        <input type="hidden" name="id" value="${esc(c.id || "")}" />
        <div class="field"><label>Full name</label><input name="name" required value="${esc(c.name || "")}" /></div>
        <div class="field"><label>Job title</label><input name="title" value="${esc(c.title || "")}" /></div>
        <div class="field"><label>Company</label><input name="company" required value="${esc(c.company || "")}" /></div>
        <div class="field"><label>Sector</label><select name="sector">${options(COM.SECTORS, c.sector || "Other")}</select></div>
        <div class="field"><label>Email</label><input name="email" type="email" value="${esc(c.email || "")}" /></div>
        <div class="field"><label>Phone</label><input name="phone" value="${esc(c.phone || "")}" /></div>
        <div class="field"><label>Interest</label><select name="interest">${options(COM.INTEREST, c.interest || "Medium interest")}</select></div>
        <div class="field"><label>Source</label><select name="source">${options(COM.SOURCES, c.source || "Email")}</select></div>
        <div class="field"><label>Country</label><input name="country" value="${esc(c.country || "Mozambique")}" /></div>
        <div class="field"><label>Website</label><input name="website" value="${esc(c.website || "")}" placeholder="https://" /></div>
        <div class="field full"><label>Notes</label><textarea name="notes">${esc(c.notes || "")}</textarea></div>
        <div class="full mf" style="padding:0">${c.id ? `<button class="btn danger left" type="button" data-action="delete-contact" data-id="${c.id}">${I.trash} Delete</button>` : ""}<button class="btn light" type="button" data-action="modal-close">Cancel</button><button class="btn dark" type="submit">${c.id ? "Save changes" : "Add lead"}</button></div>
      </form>`);
  }
  function contactDetail(id) {
    const c = Store.get("contacts", id);
    if (!c) return;
    const deals = Store.list("deals").filter((d) => d.contactId === id);
    const tasks = Store.list("tasks").filter((t) => t.contactId === id && !t.done);
    const acts = Store.list("activities").filter((a) => a.contactId === id).sort((a, b) => new Date(b.at) - new Date(a.at));
    const camps = Store.list("campaigns").filter((k) => k.contactId === id);
    const total = deals.filter((d) => d.stage === "Won").reduce((s, d) => s + Store.dealValue(d), 0);
    openModal(`${modalHead("")}
      <div class="mb" style="padding-top:0">
        <div class="detail-head">${avatar(c, "lg")}<div class="grow"><div class="row wrap" style="gap:8px"><h3 style="font-size:20px">${esc(c.name)}</h3>${interestChip(c.interest)}</div><div class="muted small">${esc(c.title)} at <b>${esc(c.company)}</b> · ${esc(c.sector || "")} · ${esc(c.country || "")}</div></div>
          <div class="row" style="gap:6px"><button class="icon-btn sm" data-action="edit-contact" data-id="${c.id}" title="Edit">${I.edit}</button><a class="icon-btn sm" href="${GoogleWS.Links.contacts(c.name)}" target="_blank" rel="noopener" title="Find in Google Contacts">${I.users}</a></div></div>
        <div class="row wrap" style="gap:8px;margin-top:14px">
          <button class="btn dark sm" data-action="email-contact" data-id="${c.id}">${I.gmail} Email</button>
          <button class="btn light sm" data-action="new-task" data-contact="${c.id}" data-type="Google Meet Call">${I.meet} Schedule Meet</button>
          <button class="btn light sm" data-action="new-deal" data-contact="${c.id}">${I.kanban} New deal</button>
          <button class="btn light sm" data-action="prop-for" data-contact="${c.id}">${I.tag} Build proposal</button>
          <button class="btn light sm" data-action="add-note" data-contact="${c.id}">${I.note} Add note</button>
        </div>
        <div class="detail-grid">
          <div class="stack" style="gap:14px">
            <div class="info-list">
              <span class="k">Email</span><a href="${GoogleWS.Links.gmail({ to: c.email })}" target="_blank" rel="noopener">${esc(c.email || "—")}</a>
              <span class="k">Phone</span><span>${esc(c.phone || "—")}</span>
              <span class="k">Source</span><span>${esc(c.source)}</span>
              <span class="k">Website</span><span>${c.website ? `<a href="${esc(c.website)}" target="_blank" rel="noopener">${esc(c.website)}</a>` : "—"}</span>
              <span class="k">Since</span><span>${fmtDate(c.createdAt)}</span>
              <span class="k">Revenue</span><span><b>${fmtMZN(total)}</b> won</span>
            </div>
            ${c.notes ? `<div class="card pad-sm" style="background:var(--card-2);box-shadow:none;font-size:12px">${esc(c.notes)}</div>` : ""}
            <div><div class="tiny muted" style="text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Deals (${deals.length})</div>
              <div class="mini-list">${deals.length ? deals.map((d) => `<div class="item"><a href="#" data-action="open-deal" data-id="${d.id}" style="color:var(--ink)"><b>${esc(d.title)}</b></a><span class="row" style="gap:6px">${stageChip(d.stage)}<b class="mono">${fmtMZN(Store.dealValue(d))}</b></span></div>`).join("") : '<div class="muted small">No deals yet.</div>'}</div></div>
            <div><div class="tiny muted" style="text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Campaigns (${camps.length})</div>
              <div class="mini-list">${camps.length ? camps.map((k) => { const r = Store.rate(k.rateId) || {}; return `<div class="item"><span>${esc(r.section)} · ${esc(r.banner)}</span><span class="row" style="gap:6px">${creativeChip(k.creative)}<span class="tiny muted">${fmtDateShort(k.start)}–${fmtDateShort(k.end)}</span></span></div>`; }).join("") : '<div class="muted small">Nothing booked.</div>'}</div></div>
          </div>
          <div class="stack" style="gap:14px">
            <div><div class="tiny muted" style="text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Open tasks (${tasks.length})</div>
              <div class="mini-list">${tasks.length ? tasks.map((t) => `<div class="item"><a href="#" data-action="edit-task" data-id="${t.id}" style="color:var(--ink)">${TASK_ICON[t.type] ? TASK_ICON[t.type].replace("<svg", '<svg width="14" height="14" style="vertical-align:-2px;margin-right:6px"') : ""}${esc(t.type)}</a><span class="tiny muted">${fmtDateShort(t.due)} ${fmtTime(t.due)}</span></div>`).join("") : '<div class="muted small">No open tasks.</div>'}</div></div>
            <div><div class="tiny muted" style="text-transform:uppercase;letter-spacing:.06em;font-weight:600;margin-bottom:4px">Activity</div>
              ${acts.length ? acts.map((a) => `<div class="activity"><span class="ic">${a.type === "email" ? I.mail : a.type === "call" ? I.phone : a.type === "meeting" ? I.video : a.type === "stage" ? I.kanban : I.note}</span><div><div>${esc(a.text)}</div><div class="when">${new Date(a.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div></div></div>`).join("") : '<div class="muted small">No activity logged.</div>'}</div>
          </div>
        </div>
      </div>`, { wide: true });
  }

  /* ============ modals: deal ============ */
  function dealForm(d, contactId) {
    d = d || { contactId: contactId || "", items: [{ rateId: "hp-full", months: 1 }], stage: "New", probability: 20, discount: 0 };
    const items = d.items && d.items.length ? d.items : [{ rateId: "hp-full", months: 1 }];
    openModal(`${modalHead(d.id ? "Edit deal" : "New deal")}
      <form data-form="deal" class="mb form-grid">
        <input type="hidden" name="id" value="${esc(d.id || "")}" />
        <div class="field full"><label>Deal title</label><input name="title" required value="${esc(d.title || "")}" placeholder="e.g. Homepage Full Banner - Q4" /></div>
        <div class="field"><label>Client</label><select name="contactId" required>${options([{ value: "", label: "— choose —" }].concat(Store.list("contacts").map((c) => ({ value: c.id, label: `${c.company} — ${c.name}` }))), d.contactId)}</select></div>
        <div class="field"><label>Stage</label><select name="stage">${options(COM.STAGES, d.stage)}</select></div>
        <div class="field"><label>Probability %</label><input name="probability" type="number" min="0" max="100" value="${d.probability ?? 20}" /></div>
        <div class="field"><label>Campaign start</label><input name="startDate" type="date" value="${toLocalDate(d.startDate)}" /></div>
        <div class="field"><label>Discount %</label><input name="discount" type="number" min="0" max="100" value="${d.discount || 0}" /></div>
        <div class="field"><label>Value (auto, excl. VAT)</label><input value="${fmtMZN(Store.dealValue(Object.assign({}, d, { items })))}" disabled /></div>
        <div class="field full"><label>Placements</label>
          <div class="proposal-lines" data-deal-lines>${items.map((it, i) => dealLine(it, i)).join("")}</div>
          <button class="btn xs light" type="button" data-action="deal-add-line" style="align-self:flex-start;margin-top:6px">${I.plus} Add placement</button></div>
        <div class="field full"><label>Notes</label><textarea name="notes">${esc(d.notes || "")}</textarea></div>
        <div class="full mf" style="padding:0">${d.id ? `<button class="btn danger left" type="button" data-action="delete-deal" data-id="${d.id}">${I.trash} Delete</button>` : ""}<button class="btn light" type="button" data-action="modal-close">Cancel</button><button class="btn dark" type="submit">${d.id ? "Save deal" : "Create deal"}</button></div>
      </form>`);
  }
  function dealLine(it, i) {
    return `<div class="line" data-line>
      <select name="rate_${i}" data-line-rate>${options(COM.RATE_CARD.map((x) => ({ value: x.id, label: `${x.section} · ${x.banner} (${fmtMZN(x.price)})` })), it.rateId)}</select>
      <input name="months_${i}" type="number" min="1" max="24" value="${Number(it.months) || 1}" data-line-months />
      <span class="tiny muted">months</span>
      <button class="icon-btn sm ghost" type="button" data-action="deal-remove-line" aria-label="Remove">${I.x}</button>
    </div>`;
  }
  function dealLinesFrom(form) {
    return Array.from(form.querySelectorAll("[data-line]")).map((l) => ({ rateId: l.querySelector("[data-line-rate]").value, months: Number(l.querySelector("[data-line-months]").value) || 1 }));
  }

  /* ============ modals: task ============ */
  function taskForm(t, preset) {
    t = t || Object.assign({ contactId: "", type: "Google Meet Call", status: "To do", due: new Date(Date.now() + 3600000).toISOString(), amount: "" }, preset || {});
    const contacts = Store.list("contacts");
    const deals = Store.list("deals").filter((d) => !t.contactId || d.contactId === t.contactId);
    openModal(`${modalHead(t.id ? "Edit task" : "New task")}
      <form data-form="task" class="mb form-grid">
        <input type="hidden" name="id" value="${esc(t.id || "")}" />
        <div class="field"><label>Type</label><select name="type">${options(COM.TASK_TYPES, t.type)}</select></div>
        <div class="field"><label>Status</label><select name="status">${options(COM.TASK_STATUS, t.status)}</select></div>
        <div class="field"><label>Client</label><select name="contactId" required>${options([{ value: "", label: "— choose —" }].concat(contacts.map((c) => ({ value: c.id, label: `${c.company} — ${c.name}` }))), t.contactId)}</select></div>
        <div class="field"><label>Deal (optional)</label><select name="dealId">${options([{ value: "", label: "—" }].concat(deals.map((d) => ({ value: d.id, label: d.title }))), t.dealId || "")}</select></div>
        <div class="field"><label>Due</label><input name="due" type="datetime-local" required value="${toLocalInput(t.due)}" /></div>
        <div class="field"><label>Duration (min)</label><input name="duration" type="number" min="15" step="15" value="${t.duration || 30}" /></div>
        <div class="field"><label>Amount (MZN, optional)</label><input name="amount" type="number" min="0" value="${t.amount || ""}" /></div>
        <div class="field"><label>Google Meet link</label><input name="meetLink" value="${esc(t.meetLink || "")}" placeholder="filled automatically when scheduled via Calendar" /></div>
        <div class="field full"><label>Notes</label><textarea name="notes">${esc(t.notes || "")}</textarea></div>
        <div class="full mf" style="padding:0">${t.id ? `<button class="btn danger left" type="button" data-action="delete-task" data-id="${t.id}">${I.trash} Delete</button>` : ""}<button class="btn light" type="button" data-action="modal-close">Cancel</button>${t.id ? `<button class="btn light" type="button" data-action="calendar-task" data-id="${t.id}">${I.gcal} Google Calendar</button>` : ""}<button class="btn dark" type="submit">${t.id ? "Save task" : "Create task"}</button></div>
      </form>`);
  }

  /* ============ modals: campaign ============ */
  function campaignForm(k) {
    k = k || { contactId: "", dealId: "", rateId: "hp-full", start: new Date().toISOString(), end: new Date(Date.now() + 30 * 86400000).toISOString(), creative: "Pending", file: "", impressions: 0, clicks: 0 };
    const spec = COM.AD_SPECS.map((s) => `${s.name}: ${s.w}×${s.h}`).join(" · ");
    openModal(`${modalHead(k.id ? "Edit campaign" : "Book campaign")}
      <form data-form="campaign" class="mb form-grid">
        <input type="hidden" name="id" value="${esc(k.id || "")}" />
        <div class="field"><label>Client</label><select name="contactId" required>${options([{ value: "", label: "— choose —" }].concat(Store.list("contacts").map((c) => ({ value: c.id, label: `${c.company} — ${c.name}` }))), k.contactId)}</select></div>
        <div class="field"><label>Deal</label><select name="dealId">${options([{ value: "", label: "—" }].concat(Store.list("deals").map((d) => ({ value: d.id, label: d.title }))), k.dealId || "")}</select></div>
        <div class="field full"><label>Placement</label><select name="rateId">${options(COM.RATE_CARD.map((x) => ({ value: x.id, label: `${x.section} · ${x.banner} — ${x.spec} — ${fmtMZN(x.price)}/month` })), k.rateId)}</select></div>
        <div class="field"><label>Start</label><input name="start" type="date" required value="${toLocalDate(k.start)}" /></div>
        <div class="field"><label>End</label><input name="end" type="date" required value="${toLocalDate(k.end)}" /></div>
        <div class="field"><label>Creative status</label><select name="creative">${options(["Pending", "Approved", "Published", "Rejected"], k.creative)}</select></div>
        <div class="field"><label>Creative file name / Drive link</label><input name="file" value="${esc(k.file || "")}" placeholder="banner_1220x300.png" /><span class="hint">${esc(spec)}. ${COM.AD_FILE_RULES}</span></div>
        <div class="field"><label>Impressions</label><input name="impressions" type="number" min="0" value="${k.impressions || 0}" /></div>
        <div class="field"><label>Clicks</label><input name="clicks" type="number" min="0" value="${k.clicks || 0}" /></div>
        ${Store.settings.mode === "oauth" ? `<div class="field full"><label>Upload creative to Google Drive</label><input type="file" accept="image/png,image/jpeg,image/gif,.doc,.docx,.pdf" data-input="creative-file" /><span class="hint">Checks pixel size against the spec, then uploads to the configured Drive folder.</span></div>` : `<div class="field full"><label>Check a creative file</label><input type="file" accept="image/png,image/jpeg,image/gif" data-input="creative-check" /><span class="hint">Validates dimensions and the 4 MB limit locally. Connect Google sign-in to upload straight to Drive.</span></div>`}
        <div class="full mf" style="padding:0">${k.id ? `<button class="btn danger left" type="button" data-action="delete-campaign" data-id="${k.id}">${I.trash} Delete</button>` : ""}<button class="btn light" type="button" data-action="modal-close">Cancel</button><button class="btn dark" type="submit">${k.id ? "Save" : "Book"}</button></div>
      </form>`);
  }

  /* ============ creative validation ============ */
  function validateCreative(file) {
    return new Promise((resolve) => {
      const r = { name: file.name, size: file.size, ok: true, issues: [] };
      if (file.size > 4 * 1024 * 1024) { r.ok = false; r.issues.push(`File is ${(file.size / 1048576).toFixed(1)} MB; limit is 4 MB.`); }
      if (!/^image\/(png|jpeg|gif)$/.test(file.type)) { r.issues.push("Not an image; skipped dimension check."); return resolve(r); }
      const img = new Image();
      img.onload = () => {
        r.w = img.naturalWidth; r.h = img.naturalHeight;
        const match = COM.AD_SPECS.find((s) => s.w === r.w && s.h === r.h);
        if (match) r.match = match.name; else { r.ok = false; r.issues.push(`${r.w}×${r.h} px does not match any banner spec (${COM.AD_SPECS.map((s) => s.w + "×" + s.h).join(", ")}).`); }
        URL.revokeObjectURL(img.src); resolve(r);
      };
      img.onerror = () => { r.issues.push("Could not read image."); resolve(r); };
      img.src = URL.createObjectURL(file);
    });
  }

  /* ============ Google actions ============ */
  function taskDescription(t, c, d) {
    return [`Client: ${c ? c.name + " — " + c.company : ""}`, c && c.email ? `Email: ${c.email}` : null, c && c.phone ? `Phone: ${c.phone}` : null, d ? `Deal: ${d.title} (${fmtMZN(Store.dealValue(d))} excl. VAT)` : null, t.notes ? `Notes: ${t.notes}` : null, "", "Created from Club of Mozambique CRM"].filter((x) => x !== null).join("\n");
  }
  async function scheduleTask(id) {
    const t = Store.get("tasks", id); if (!t) return;
    const c = Store.get("contacts", t.contactId), d = t.dealId ? Store.get("deals", t.dealId) : null;
    const title = `${t.type}: ${c ? c.company : ""}`.trim();
    const wantMeet = t.type === "Google Meet Call";
    if (Store.settings.mode === "oauth") {
      try {
        const ev = await GoogleWS.createMeeting({ title, startISO: t.due, durationMin: t.duration || 30, description: taskDescription(t, c, d), attendees: [c && c.email, Store.settings.userEmail] });
        Store.update("tasks", id, { meetLink: ev.meetLink, calendarEventId: ev.id, calendarLink: ev.htmlLink, status: wantMeet ? "Call scheduled" : t.status });
        Store.logActivity(t.contactId, "meeting", `${t.type} scheduled in Google Calendar for ${fmtDate(t.due)} ${fmtTime(t.due)}${ev.meetLink ? " · Meet link created" : ""}`);
        toast("Event created in Google Calendar", "ok", ev.meetLink ? ` <a href="${esc(ev.meetLink)}" target="_blank" rel="noopener">Open Meet</a>` : ` <a href="${esc(ev.htmlLink)}" target="_blank" rel="noopener">Open</a>`);
        closeModal(); render();
        return;
      } catch (e) { toast(e.message, "err"); }
    }
    // Fallback: pre-filled Google Calendar template (Meet is added by Google when the user saves with "Add Google Meet").
    window.open(GoogleWS.Links.calendar({ title, startISO: t.due, durationMin: t.duration || 30, details: taskDescription(t, c, d), guests: c && c.email }), "_blank", "noopener");
    if (wantMeet) Store.update("tasks", id, { status: "Call scheduled" });
    Store.logActivity(t.contactId, "meeting", `${t.type} added to Google Calendar for ${fmtDate(t.due)} ${fmtTime(t.due)}`);
    render();
  }
  async function emailContact(contactId, subject, body) {
    const c = Store.get("contacts", contactId); if (!c) return;
    subject = subject || `Club of Mozambique — advertising opportunities for ${c.company}`;
    body = body || `Dear ${c.name.split(" ")[0]},\n\nThank you for your interest in Club of Mozambique. Our platform reaches ${fmtNum(COM.MEDIA_KIT.activeUsers)} active users and ${fmtNum(COM.MEDIA_KIT.pageviews)} pageviews a year, with readers who are business leaders and decision-makers across Southern Africa and beyond.\n\nI would be glad to walk you through our 2026 rate card and find the placement that fits ${c.company}.\n\nKind regards,\n${Store.settings.userName}\nClub of Mozambique · ${COM.BRAND.site}\n${COM.BRAND.emails.marketing}`;
    if (Store.settings.mode === "oauth" && GoogleWS.isSignedIn()) {
      try {
        const d = await GoogleWS.createDraft({ to: c.email, subject, body });
        Store.logActivity(contactId, "email", `Gmail draft created: "${subject}"`);
        toast("Draft saved in Gmail", "ok", ` <a href="${d.link}" target="_blank" rel="noopener">Open drafts</a>`);
        render(); return;
      } catch (e) { toast(e.message, "err"); }
    }
    window.open(GoogleWS.Links.gmail({ to: c.email, subject, body }), "_blank", "noopener");
    Store.logActivity(contactId, "email", `Email opened in Gmail: "${subject}"`);
    render();
  }
  async function googleSync(direction) {
    try {
      toast(direction === "push" ? "Pushing to Google Sheets…" : "Pulling from Google Sheets…");
      if (direction === "push") await GoogleWS.push(); else await GoogleWS.pull();
      toast("Sync complete", "ok", Store.settings.spreadsheetId ? ` <a href="${GoogleWS.Links.sheet(Store.settings.spreadsheetId)}" target="_blank" rel="noopener">Open sheet</a>` : "");
      render();
    } catch (e) { toast(e.message, "err"); }
  }
  async function loadCalendar() {
    if (Store.settings.mode !== "oauth" || !GoogleWS.isSignedIn()) return;
    try { ui.calendarEvents = await GoogleWS.todaysEvents(); render(); toast(`Loaded ${ui.calendarEvents.length} calendar event${ui.calendarEvents.length === 1 ? "" : "s"} for today`, "ok"); }
    catch (e) { toast(e.message, "err"); }
  }

  /* ============ CSV ============ */
  function toCSV(rows) {
    if (!rows.length) return "";
    const keys = Object.keys(rows.reduce((a, r) => Object.assign(a, r), {}));
    const cell = (v) => { if (v == null) return ""; v = typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return [keys.join(","), ...rows.map((r) => keys.map((k) => cell(r[k])).join(","))].join("\n");
  }
  function parseCSV(text) {
    const rows = []; let row = [], cur = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
      else if (ch === '"') q = true; else if (ch === ",") { row.push(cur); cur = ""; } else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; } else cur += ch;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    const head = rows.shift() || [];
    return rows.filter((r) => r.some((c) => c.trim())).map((r) => { const o = {}; head.forEach((h, i) => { o[h.trim()] = (r[i] || "").trim(); }); return o; });
  }
  function download(name, text, type) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: type || "text/plain" })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function exportCSV(col) {
    const rows = Store.list(col).map((r) => { const o = Object.assign({}, r); if (col !== "contacts") { o.contact = Store.contactName(r.contactId); o.company = Store.contactCompany(r.contactId); } if (col === "deals") o.value = Store.dealValue(r); if (col === "campaigns") { const rt = Store.rate(r.rateId); o.placement = rt ? rt.section + " · " + rt.banner : ""; } return o; });
    download(`com-crm-${col}-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows), "text/csv");
  }
  function importContactsCSV(text) {
    const rows = parseCSV(text);
    let n = 0;
    rows.forEach((r) => {
      const name = r.name || r.Name || r["Full Name"] || [r["First Name"], r["Last Name"]].filter(Boolean).join(" ");
      if (!name) return;
      const email = r.email || r.Email || r["E-mail 1 - Value"] || r["E-mail Address"] || "";
      if (email && Store.list("contacts").some((c) => c.email && c.email.toLowerCase() === email.toLowerCase())) return;
      Store.add("contacts", { name, title: r.title || r.Title || r["Job Title"] || "", company: r.company || r.Company || r.Organization || r["Organization Name"] || r["Organization 1 - Name"] || "", email, phone: r.phone || r.Phone || r["Phone 1 - Value"] || "", sector: COM.SECTORS.includes(r.sector) ? r.sector : "Other", source: COM.SOURCES.includes(r.source) ? r.source : "Email", interest: COM.INTEREST.includes(r.interest) ? r.interest : "Medium interest", country: r.country || r.Country || "" });
      n++;
    });
    toast(`Imported ${n} contact${n === 1 ? "" : "s"}`, "ok"); render();
  }

  /* ============ events ============ */
  document.addEventListener("click", async (e) => {
    const stop = e.target.closest("[data-stop]"); if (stop) { e.stopPropagation(); return; }
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const act = el.dataset.action, id = el.dataset.id;
    if (act !== "modal-backdrop" && el.tagName === "A" && !el.getAttribute("href").startsWith("http") && !el.getAttribute("href").startsWith("mailto") && !el.getAttribute("href").startsWith("tel")) e.preventDefault();
    if (act === "modal-backdrop" && e.target !== el) return;
    switch (act) {
      case "nav": ui.view = el.dataset.view; location.hash = ui.view; closeModal(); render(); $("#view").scrollTop = 0; break;
      case "modal-close": case "modal-backdrop": closeModal(); break;
      case "open-url": if (el.dataset.url) window.open(el.dataset.url, "_blank", "noopener"); break;
      case "lead-filter": ui.leadFilter = el.dataset.f; render(); break;
      case "task-filter": ui.taskFilter = el.dataset.f; render(); break;
      case "new-contact": contactForm(); break;
      case "open-contact": contactDetail(id); break;
      case "edit-contact": contactForm(Store.get("contacts", id)); break;
      case "delete-contact": if (confirm("Delete this lead and all related deals, tasks and campaigns?")) { Store.remove("contacts", id); closeModal(); render(); toast("Lead deleted"); } break;
      case "email-contact": emailContact(id); break;
      case "add-note": { const text = prompt("Note for " + Store.contactName(el.dataset.contact)); if (text) { Store.logActivity(el.dataset.contact, "note", text); contactDetail(el.dataset.contact); toast("Note added", "ok"); } break; }
      case "new-deal": dealForm(null, el.dataset.contact); break;
      case "open-deal": dealForm(Store.get("deals", id)); break;
      case "delete-deal": if (confirm("Delete this deal?")) { Store.remove("deals", id); closeModal(); render(); toast("Deal deleted"); } break;
      case "deal-add-line": { const wrap = $("[data-deal-lines]"); wrap.insertAdjacentHTML("beforeend", dealLine({ rateId: "hp-full", months: 1 }, wrap.children.length)); break; }
      case "deal-remove-line": { const line = el.closest("[data-line]"); if (line && line.parentElement.children.length > 1) line.remove(); break; }
      case "new-task": taskForm(null, { contactId: el.dataset.contact || "", type: el.dataset.type || "Google Meet Call" }); break;
      case "edit-task": taskForm(Store.get("tasks", id)); break;
      case "delete-task": if (confirm("Delete this task?")) { Store.remove("tasks", id); closeModal(); render(); } break;
      case "toggle-task": { const t = Store.get("tasks", id); Store.update("tasks", id, { done: !t.done, status: !t.done ? "Done" : "To do" }); if (!t.done) Store.logActivity(t.contactId, "note", `Task completed: ${t.type}`); render(); break; }
      case "email-task": { const t = Store.get("tasks", id); const c = Store.get("contacts", t.contactId); const d = t.dealId ? Store.get("deals", t.dealId) : null; emailContact(t.contactId, `${t.type} — ${c ? c.company : ""}${d ? " · " + d.title : ""}`); break; }
      case "meet-task": { const t = Store.get("tasks", id); if (t && t.meetLink) window.open(t.meetLink, "_blank", "noopener"); else if (t) scheduleTask(id); else window.open(GoogleWS.Links.meetNew(), "_blank", "noopener"); break; }
      case "calendar-task": scheduleTask(id); break;
      case "new-campaign": campaignForm(); break;
      case "edit-campaign": campaignForm(Store.get("campaigns", id)); break;
      case "delete-campaign": if (confirm("Delete this campaign?")) { Store.remove("campaigns", id); closeModal(); render(); } break;
      case "prop-add": ui.proposal.lines.push({ rateId: el.dataset.rate || "hp-full", months: 1 }); render(); $("#proposal") && $("#proposal").scrollIntoView({ behavior: "smooth", block: "nearest" }); break;
      case "prop-remove": ui.proposal.lines.splice(Number(el.dataset.i), 1); if (!ui.proposal.lines.length) ui.proposal.lines.push({ rateId: "hp-full", months: 1 }); render(); break;
      case "prop-for": ui.proposal.contactId = el.dataset.contact; ui.view = "ratecard"; location.hash = "ratecard"; closeModal(); render(); break;
      case "prop-create-deal": {
        const p = ui.proposal, c = Store.get("contacts", p.contactId); if (!c) break;
        const t = proposalTotals(p);
        const deal = Store.add("deals", { contactId: c.id, title: `${c.company} — ${t.lines.map((l) => l.r.banner).join(" + ")}`, items: p.lines.map((l) => ({ rateId: l.rateId, months: Number(l.months) || 1 })), discount: Number(p.discount) || 0, stage: "Proposal Sent", probability: 50, startDate: new Date(Date.now() + 14 * 86400000).toISOString(), notes: p.notes });
        Store.logActivity(c.id, "stage", `Proposal created: ${fmtMZN(t.net)} excl. VAT`);
        toast("Deal created in Proposal Sent", "ok"); ui.view = "pipeline"; location.hash = "pipeline"; render(); void deal; break;
      }
      case "prop-email": { const p = ui.proposal, c = Store.get("contacts", p.contactId); if (c) emailContact(c.id, `Club of Mozambique — advertising proposal for ${c.company}`, `Dear ${c.name.split(" ")[0]},\n\nPlease find our proposal below.\n\n${proposalText(p)}\n\nKind regards,\n${Store.settings.userName}`); break; }
      case "prop-copy": try { await navigator.clipboard.writeText(proposalText(ui.proposal)); toast("Proposal copied to clipboard", "ok"); } catch (err) { toast("Clipboard blocked by the browser", "err"); } break;
      case "prop-print": {
        const w = window.open("", "_blank");
        w.document.write(`<!doctype html><title>Proposal</title><style>body{font-family:Poppins,system-ui,sans-serif;padding:40px;max-width:800px;margin:auto;color:#1c2733}pre{white-space:pre-wrap;font:inherit;line-height:1.6}h1{color:#80b641;font-size:22px}small{color:#6f7d8b}</style><h1>Club of Mozambique · Advertising Proposal</h1><small>${esc(COM.BRAND.site)} · ${esc(COM.BRAND.emails.marketing)}</small><pre>${esc(proposalText(ui.proposal))}</pre>`);
        w.document.close(); setTimeout(() => w.print(), 300); break;
      }
      case "export-csv": exportCSV(el.dataset.col); break;
      case "import-csv-prompt": openModal(`${modalHead("Import contacts from CSV")}<div class="mb stack" style="gap:12px"><p class="small muted">Works with Google Contacts exports (Name, E-mail 1 - Value, Organization Name…) or a simple <code>name,company,email,phone,title,sector,source,interest,country</code> file. Existing emails are skipped.</p><label class="btn dark" style="align-self:flex-start;cursor:pointer">${I.upload} Choose CSV file<input type="file" accept=".csv,text/csv" hidden data-input="import-csv" /></label></div>`); break;
      case "export-json": download(`com-crm-backup-${new Date().toISOString().slice(0, 10)}.json`, Store.exportJSON(), "application/json"); break;
      case "reset-demo": if (confirm("Replace all data with the demo dataset?")) { Store.resetDemo(); render(); toast("Demo data restored"); } break;
      case "clear-all": if (confirm("Delete ALL contacts, deals, tasks and campaigns from this browser? Export a backup first.")) { Store.clearAll(); render(); toast("All data deleted"); } break;
      case "set-mode": Store.setSettings({ mode: el.dataset.mode }); render(); break;
      case "g-signin": try { await GoogleWS.init(Store.settings.clientId); const p = await GoogleWS.signIn(); toast(`Signed in as ${p.email}`, "ok"); render(); loadCalendar(); } catch (err) { toast(err.message, "err"); } break;
      case "g-signout": GoogleWS.signOut(); ui.calendarEvents = null; render(); toast("Signed out of Google"); break;
      case "g-push": googleSync("push"); break;
      case "g-pull": if (confirm("Replace local data with the Google Sheet contents?")) googleSync("pull"); break;
      case "g-refresh-cal": loadCalendar(); break;
      default: break;
    }
  });

  document.addEventListener("input", (e) => {
    const el = e.target.closest("[data-input]"); if (!el) return;
    const k = el.dataset.input;
    if (k === "lead-search") { ui.leadSearch = el.value; rerenderKeepingFocus(el); }
    if (k === "task-search") { ui.taskSearch = el.value; rerenderKeepingFocus(el); }
    if (k === "deal-search") { ui.dealSearch = el.value; rerenderKeepingFocus(el); }
    if (k === "prop-months") { ui.proposal.lines[Number(el.dataset.i)].months = Math.max(1, Number(el.value) || 1); rerenderKeepingFocus(el); }
    if (k === "prop-discount") { ui.proposal.discount = Math.min(100, Math.max(0, Number(el.value) || 0)); rerenderKeepingFocus(el); }
    if (k === "prop-notes") { ui.proposal.notes = el.value; }
  });
  document.addEventListener("change", async (e) => {
    const el = e.target.closest("[data-input]"); if (!el) return;
    const k = el.dataset.input;
    if (k === "lead-sort") { ui.leadSort = el.value; render(); }
    if (k === "prop-contact") { ui.proposal.contactId = el.value; render(); }
    if (k === "prop-rate") { ui.proposal.lines[Number(el.dataset.i)].rateId = el.value; render(); }
    if (k === "task-status") { const t = Store.get("tasks", el.dataset.id); Store.update("tasks", el.dataset.id, { status: el.value, done: el.value === "Done" }); if (t) Store.logActivity(t.contactId, "note", `${t.type} → ${el.value}`); render(); }
    if (k === "import-json") { const f = el.files[0]; if (!f) return; try { const j = JSON.parse(await f.text()); Store.replaceAll(j); if (j.settings && j.settings.vatRate) Store.setSettings({ vatRate: j.settings.vatRate }); render(); toast("Backup imported", "ok"); } catch (err) { toast("Invalid JSON file", "err"); } }
    if (k === "import-csv") { const f = el.files[0]; if (!f) return; importContactsCSV(await f.text()); closeModal(); }
    if (k === "creative-check" || k === "creative-file") {
      const f = el.files[0]; if (!f) return;
      const r = await validateCreative(f);
      const form = el.closest("form");
      if (form && form.file) form.file.value = f.name;
      if (r.ok) toast(`${f.name}: ${r.match ? r.match + " ✓" : "size OK"}`, "ok"); else toast(r.issues.join(" "), "err");
      if (k === "creative-file" && r.ok) {
        try { toast("Uploading to Google Drive…"); const up = await GoogleWS.uploadFile(f); if (form) { form.file.value = up.name; form.dataset.fileLink = up.webViewLink; } toast("Uploaded to Drive", "ok", ` <a href="${esc(up.webViewLink)}" target="_blank" rel="noopener">Open</a>`); }
        catch (err) { toast(err.message, "err"); }
      }
    }
  });
  function rerenderKeepingFocus(el) {
    const k = el.dataset.input, i = el.dataset.i, pos = el.selectionStart;
    render();
    const again = i != null ? $(`[data-input="${k}"][data-i="${i}"]`) : $(`[data-input="${k}"]`);
    if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (err) { /* number inputs */ } }
  }

  document.addEventListener("submit", (e) => {
    const form = e.target.closest("[data-form]"); if (!form) return;
    e.preventDefault();
    const kind = form.dataset.form, f = formData(form);
    if (kind === "contact") {
      const rec = { name: f.name, title: f.title, company: f.company, sector: f.sector, email: f.email, phone: f.phone, interest: f.interest, source: f.source, country: f.country, website: f.website, notes: f.notes };
      if (f.id) { Store.update("contacts", f.id, rec); toast("Lead updated", "ok"); contactDetail(f.id); }
      else { const c = Store.add("contacts", rec); Store.logActivity(c.id, "note", `Lead created from ${c.source}`); toast("Lead added", "ok"); closeModal(); }
      render(); return;
    }
    if (kind === "deal") {
      const items = dealLinesFrom(form);
      const rec = { title: f.title, contactId: f.contactId, stage: f.stage, probability: Number(f.probability) || 0, startDate: f.startDate ? new Date(f.startDate + "T09:00").toISOString() : "", discount: Number(f.discount) || 0, notes: f.notes, items };
      if (f.stage === "Won") rec.probability = 100; if (f.stage === "Lost") rec.probability = 0;
      if (f.id) { const old = Store.get("deals", f.id); Store.update("deals", f.id, rec); if (old && old.stage !== rec.stage) Store.logActivity(rec.contactId, "stage", `${rec.title}: ${old.stage} → ${rec.stage}`); toast("Deal saved", "ok"); }
      else { Store.add("deals", rec); Store.logActivity(rec.contactId, "stage", `Deal created: ${rec.title} (${rec.stage})`); toast("Deal created", "ok"); }
      closeModal(); render(); return;
    }
    if (kind === "task") {
      const rec = { type: f.type, status: f.status, contactId: f.contactId, dealId: f.dealId, due: new Date(f.due).toISOString(), duration: Number(f.duration) || 30, amount: f.amount ? Number(f.amount) : null, meetLink: f.meetLink, notes: f.notes, done: f.status === "Done" };
      if (f.id) Store.update("tasks", f.id, rec); else Store.add("tasks", rec);
      toast(f.id ? "Task saved" : "Task created", "ok"); closeModal(); render(); return;
    }
    if (kind === "campaign") {
      const rec = { contactId: f.contactId, dealId: f.dealId, rateId: f.rateId, start: new Date(f.start + "T00:00").toISOString(), end: new Date(f.end + "T23:59").toISOString(), creative: f.creative, file: f.file, impressions: Number(f.impressions) || 0, clicks: Number(f.clicks) || 0 };
      if (form.dataset.fileLink) rec.fileLink = form.dataset.fileLink;
      if (f.id) Store.update("campaigns", f.id, rec); else Store.add("campaigns", rec);
      toast(f.id ? "Campaign saved" : "Campaign booked", "ok"); closeModal(); render(); return;
    }
    if (kind === "settings") {
      Store.setSettings({ clientId: (f.clientId || Store.settings.clientId || "").trim(), spreadsheetId: (f.spreadsheetId !== undefined ? f.spreadsheetId : Store.settings.spreadsheetId || "").trim(), appsScriptUrl: (f.appsScriptUrl !== undefined ? f.appsScriptUrl : Store.settings.appsScriptUrl || "").trim(), calendarId: (f.calendarId || Store.settings.calendarId || "primary").trim(), driveFolderUrl: (f.driveFolderUrl || "").trim(), vatRate: Number(f.vatRate) || 0, userName: f.userName || "Marketing Team", userEmail: f.userEmail || "" });
      toast("Settings saved", "ok"); render();
    }
  });

  /* drag & drop on the kanban */
  let dragId = null;
  document.addEventListener("dragstart", (e) => { const card = e.target.closest("[data-deal]"); if (!card) return; dragId = card.dataset.deal; card.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; });
  document.addEventListener("dragend", (e) => { const card = e.target.closest("[data-deal]"); if (card) card.classList.remove("dragging"); document.querySelectorAll(".kcol.over").forEach((c) => c.classList.remove("over")); });
  document.addEventListener("dragover", (e) => { const col = e.target.closest(".kcol"); if (!col || !dragId) return; e.preventDefault(); document.querySelectorAll(".kcol.over").forEach((c) => c.classList.remove("over")); col.classList.add("over"); });
  document.addEventListener("drop", (e) => {
    const col = e.target.closest(".kcol"); if (!col || !dragId) return; e.preventDefault();
    const d = Store.get("deals", dragId), stage = col.dataset.stage;
    if (d && d.stage !== stage) {
      const patch = { stage }; if (stage === "Won") patch.probability = 100; else if (stage === "Lost") patch.probability = 0; else if (stage === "Negotiation") patch.probability = Math.max(d.probability || 0, 70); else if (stage === "Proposal Sent") patch.probability = Math.max(d.probability || 0, 50); else if (stage === "Contacted") patch.probability = Math.max(d.probability || 0, 30);
      Store.update("deals", dragId, patch);
      Store.logActivity(d.contactId, "stage", `${d.title}: ${d.stage} → ${stage}`);
      if (stage === "Won") toast(`Deal won · ${fmtMZN(Store.dealValue(d))}`, "ok");
    }
    dragId = null; render();
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  window.addEventListener("hashchange", () => { const v = location.hash.slice(1); if (v && v !== ui.view) { ui.view = v; render(); } });
  Store.subscribe(() => { /* state changed elsewhere (sync) */ });
  GoogleWS.on((evt) => { if (evt === "signin") loadCalendar(); if (evt === "signout") { ui.calendarEvents = null; render(); } });

  render();
  setInterval(renderTopbar, 60000); // keep "now" highlight fresh
})();
