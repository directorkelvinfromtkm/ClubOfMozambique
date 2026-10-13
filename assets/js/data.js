/* ------------------------------------------------------------------
 * Club of Mozambique CRM - reference data
 * Rate card, ad specifications and audience facts come straight from
 * the Club of Mozambique Media Kit (incl. 2026).  Seed records are
 * demo data so the app is usable before Google Workspace is connected.
 * ------------------------------------------------------------------ */

window.COM = window.COM || {};

COM.BRAND = {
  name: "Club of Mozambique",
  site: "www.clubofmozambique.com",
  owner: "MozParks",
  emails: {
    marketing: "marketing@clubofmozambique.com",
    editorial: "editorial@clubofmozambique.com",
  },
  currency: "MZN",
  vatRate: 0.16, // IVA - applicable legal rate in Mozambique, editable in Settings
};

/* Rate card (price per month, excl. VAT) - Media Kit p.10 */
COM.RATE_CARD = [
  { id: "hp-full",   section: "Homepage",        banner: "Full Banner",                price: 55000, spec: "1220 x 300 px" },
  { id: "cat-full",  section: "Categories",      banner: "Full Banner",                price: 40000, spec: "1220 x 300 px" },
  { id: "art-top",   section: "Articles",        banner: "Right Side Banner - Top",    price: 60000, spec: "500 x 430 px" },
  { id: "art-bot",   section: "Articles",        banner: "Right Side Banner - Bottom", price: 52000, spec: "500 x 320 px" },
  { id: "opinion",   section: "Opinion Article", banner: "Article on website",         price: 75000, spec: "Written in English + Word + JPEG" },
];

/* Ad specifications - Media Kit p.9 */
COM.AD_SPECS = [
  { name: "Full Banner",                w: 1220, h: 300 },
  { name: "Right Side Banner - Top",    w: 500,  h: 430 },
  { name: "Right Side Banner - Bottom", w: 500,  h: 320 },
];
COM.AD_FILE_RULES = "GIF or static images (JPEG, PNG). Maximum file size 4 MB.";

/* Free, value-added products - Media Kit p.8 */
COM.FREE_PRODUCTS = [
  { name: "Events - What's On",       contact: "marketing@clubofmozambique.com", format: "Written in English + Word + JPEG" },
  { name: "Press Releases - Article", contact: "editorial@clubofmozambique.com", format: "Written in English + Word + JPEG" },
];

/* Audience facts (Jan 1 - Dec 31, 2025) and social (Jan 2026) */
COM.MEDIA_KIT = {
  period: "1 Jan - 31 Dec 2025",
  activeUsers: 2400000,
  pageviews: 7800000,
  gender: { female: 33.7, male: 66.3 },
  countries: [
    { name: "South Africa",   users: 948779, pct: 40.27 },
    { name: "Mozambique",     users: 301926, pct: 12.81 },
    { name: "United States",  users: 178548, pct: 7.58 },
    { name: "Zimbabwe",       users: 148594, pct: 6.31 },
    { name: "United Kingdom", users: 89029,  pct: 3.78 },
    { name: "Singapore",      users: 79731,  pct: 3.38 },
    { name: "China",          users: 62238,  pct: 2.64 },
  ],
  social: [
    { name: "LinkedIn",  followers: 70000 },
    { name: "Facebook",  followers: 49000 },
    { name: "X-Twitter", followers: 31000 },
    { name: "Instagram", followers: 16300 },
  ],
  sections: ["Homepage", "Business & Economy", "Politics & Society", "International", "What's On"],
};

COM.INTEREST = ["Hot Client", "Great interest", "Medium interest", "Low interest", "Non interest"];
COM.SOURCES  = ["LinkedIn", "Email", "Referral", "Event", "Website", "Facebook", "Phone"];
COM.SECTORS  = ["Banking", "Mining & Energy", "Telecom", "Agriculture", "Property", "Tourism", "Logistics", "Agency", "NGO / Development", "Government", "Other"];
COM.STAGES   = ["New", "Contacted", "Proposal Sent", "Negotiation", "Won", "Lost"];
COM.TASK_TYPES = ["Google Meet Call", "Phone Call", "Send Proposal", "Send Invoice", "Collect Creative", "Follow-up Email", "Publish Campaign", "Report"];
COM.TASK_STATUS = ["To do", "Call scheduled", "Waiting Proposal", "Waiting Creative", "Done"];

function d(offsetDays, hour, minute) {
  const t = new Date();
  t.setHours(hour || 9, minute || 0, 0, 0);
  t.setDate(t.getDate() + (offsetDays || 0));
  return t.toISOString();
}

COM.SEED = {
  contacts: [
    { id: "c1", name: "Sophia Martins",  title: "Marketing Director", company: "Standard Bank Moçambique", sector: "Banking",         email: "sophia.martins@example.com", phone: "+258 84 000 0001", source: "LinkedIn", interest: "Hot Client",      country: "Mozambique",    createdAt: d(-3) },
    { id: "c2", name: "Liam Anderson",   title: "Financial Manager",  company: "Vertex Energy",             sector: "Mining & Energy", email: "liam@example.com",           phone: "+27 82 000 0002",  source: "Email",    interest: "Great interest",  country: "South Africa",  createdAt: d(-5) },
    { id: "c3", name: "Noah Bennett",    title: "Operations Manager", company: "BrightCore Logistics",      sector: "Logistics",       email: "noah@example.com",           phone: "+258 82 000 0003", source: "Referral", interest: "Medium interest", country: "Mozambique",    createdAt: d(-6) },
    { id: "c4", name: "Ethan Harper",    title: "Head of Growth",     company: "CodeWave Agency",           sector: "Agency",          email: "ethan@example.com",          phone: "+44 7700 000004",  source: "Website",  interest: "Great interest",  country: "United Kingdom", createdAt: d(-8) },
    { id: "c5", name: "Ava Williams",    title: "CEO",                company: "BlueHorizon Tourism",       sector: "Tourism",         email: "ava@example.com",            phone: "+258 84 000 0005", source: "Event",    interest: "Hot Client",      country: "Mozambique",    createdAt: d(-10) },
    { id: "c6", name: "David Thompson",  title: "CEO",                company: "Innovatek",                 sector: "Telecom",         email: "david@example.com",          phone: "+258 86 000 0006", source: "LinkedIn", interest: "Great interest",  country: "Mozambique",    createdAt: d(-12) },
    { id: "c7", name: "Mia Johnson",     title: "Brand Manager",      company: "Creative Studio",           sector: "Agency",          email: "mia@example.com",            phone: "+27 83 000 0007",  source: "Facebook", interest: "Medium interest", country: "South Africa",  createdAt: d(-14) },
    { id: "c8", name: "Carlos Machava",  title: "Communications Lead", company: "Porto de Maputo",          sector: "Logistics",       email: "carlos@example.com",         phone: "+258 84 000 0008", source: "Phone",    interest: "Low interest",    country: "Mozambique",    createdAt: d(-20) },
  ],
  deals: [
    { id: "d1", contactId: "c1", title: "Homepage Full Banner - Q4",         items: [{ rateId: "hp-full",  months: 3 }],                                   stage: "Negotiation",   probability: 70, startDate: d(20), notes: "Wants exclusivity on Homepage for October-December.", createdAt: d(-3) },
    { id: "d2", contactId: "c2", title: "Mining week - Articles Top",        items: [{ rateId: "art-top",  months: 1 }, { rateId: "opinion", months: 1 }],  stage: "Proposal Sent", probability: 50, startDate: d(30), notes: "", createdAt: d(-5) },
    { id: "d3", contactId: "c3", title: "Categories banner - Logistics",     items: [{ rateId: "cat-full", months: 2 }],                                   stage: "Contacted",     probability: 30, startDate: d(45), notes: "", createdAt: d(-6) },
    { id: "d4", contactId: "c4", title: "Agency package - 3 clients",        items: [{ rateId: "art-bot",  months: 6 }],                                   stage: "New",           probability: 20, startDate: d(60), notes: "Agency asked for volume discount.", createdAt: d(-8) },
    { id: "d5", contactId: "c5", title: "Tourism season - Opinion Articles", items: [{ rateId: "opinion",  months: 2 }, { rateId: "hp-full", months: 1 }],  stage: "Won",           probability: 100, startDate: d(-15), notes: "Signed. Creatives received.", createdAt: d(-30) },
    { id: "d6", contactId: "c6", title: "Innovatek launch - Homepage",       items: [{ rateId: "hp-full",  months: 1 }],                                   stage: "Won",           probability: 100, startDate: d(-5), notes: "", createdAt: d(-25) },
    { id: "d7", contactId: "c7", title: "Creative Studio - Articles Bottom", items: [{ rateId: "art-bot",  months: 1 }],                                   stage: "Lost",          probability: 0, startDate: d(-40), notes: "Budget moved to radio.", createdAt: d(-50) },
    { id: "d8", contactId: "c8", title: "Port expansion press release",      items: [{ rateId: "opinion",  months: 1 }],                                   stage: "Won",           probability: 100, startDate: d(-60), notes: "", createdAt: d(-70) },
  ],
  tasks: [
    { id: "t1", contactId: "c6", dealId: "d6", type: "Google Meet Call",  status: "Call scheduled",   due: d(0, 14, 0),  amount: null,   done: false, meetLink: "" },
    { id: "t2", contactId: "c5", dealId: "d5", type: "Send Proposal",     status: "Waiting Proposal", due: d(0, 11, 0),  amount: 20000,  done: false, meetLink: "" },
    { id: "t3", contactId: "c7", dealId: "d7", type: "Google Meet Call",  status: "Call scheduled",   due: d(0, 20, 0),  amount: null,   done: false, meetLink: "" },
    { id: "t4", contactId: "c1", dealId: "d1", type: "Follow-up Email",   status: "To do",            due: d(1, 9, 30),  amount: null,   done: false, meetLink: "" },
    { id: "t5", contactId: "c2", dealId: "d2", type: "Collect Creative",  status: "Waiting Creative", due: d(-1, 16, 0), amount: null,   done: false, meetLink: "" },
    { id: "t6", contactId: "c3", dealId: "d3", type: "Phone Call",        status: "To do",            due: d(2, 10, 0),  amount: null,   done: false, meetLink: "" },
    { id: "t7", contactId: "c4", dealId: "d4", type: "Send Invoice",      status: "Done",             due: d(-2, 12, 0), amount: 312000, done: true,  meetLink: "" },
  ],
  campaigns: [
    { id: "k1", dealId: "d6", contactId: "c6", rateId: "hp-full", start: d(-5),  end: d(25),  creative: "Approved",  file: "innovatek_1220x300.png", clicks: 1240, impressions: 210000 },
    { id: "k2", dealId: "d5", contactId: "c5", rateId: "opinion", start: d(-15), end: d(45),  creative: "Published", file: "bluehorizon_opinion.docx", clicks: 3120, impressions: 88000 },
    { id: "k3", dealId: "d5", contactId: "c5", rateId: "hp-full", start: d(30),  end: d(60),  creative: "Pending",   file: "", clicks: 0, impressions: 0 },
    { id: "k4", dealId: "d8", contactId: "c8", rateId: "opinion", start: d(-60), end: d(-30), creative: "Published", file: "porto_maputo_pr.docx", clicks: 2210, impressions: 61000 },
  ],
  activities: [
    { id: "a1", contactId: "c1", type: "note",  text: "Met at the Mozambique Banking Forum. Very keen on Homepage placement.", at: d(-3, 15) },
    { id: "a2", contactId: "c1", type: "email", text: "Sent media kit and rate card.", at: d(-2, 10) },
    { id: "a3", contactId: "c5", type: "call",  text: "Confirmed second opinion article for December.", at: d(-1, 9) },
    { id: "a4", contactId: "c2", type: "email", text: "Proposal sent: Articles Top + Opinion.", at: d(-4, 17) },
  ],
};
