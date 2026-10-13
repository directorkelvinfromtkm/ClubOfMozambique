/**
 * Club of Mozambique CRM - Google Apps Script backend (optional).
 *
 * Deploy this script bound to a Google Sheet and publish it as a Web App.
 * The CRM (index.html, Settings -> "Apps Script" mode) then stores every
 * collection in a tab of that sheet, so the whole marketing team shares one
 * database inside Google Workspace with no Cloud project or OAuth client.
 *
 * Setup
 *  1. Create a Google Sheet (e.g. "Club of Mozambique CRM").
 *  2. Extensions -> Apps Script, replace Code.gs with this file and copy
 *     appsscript.json into the project (enable "Show appsscript.json" in
 *     Project Settings).
 *  3. Deploy -> New deployment -> Web app.
 *       Execute as:      Me
 *       Who has access:  Anyone within <your Workspace domain>  (or Anyone with the link)
 *  4. Paste the /exec URL into the CRM Settings page and press "Push to Google Sheets".
 *  5. (Optional) run installDailyDigest() once to email the team a task digest at 07:30.
 */

var COLLECTIONS = ["contacts", "deals", "tasks", "campaigns", "activities"];
var TAB = { contacts: "Contacts", deals: "Deals", tasks: "Tasks", campaigns: "Campaigns", activities: "Activities" };
var DIGEST_TO = "marketing@clubofmozambique.com";

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "readAll";
  try {
    if (action === "readAll") return json_({ ok: true, data: readAll_() });
    if (action === "ping") return json_({ ok: true, data: { sheet: SpreadsheetApp.getActive().getName(), time: new Date().toISOString() } });
    return json_({ ok: false, error: "Unknown action" });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || "{}");
    var action = body.action, payload = body.payload || {};
    if (action === "readAll") return json_({ ok: true, data: readAll_() });
    if (action === "replaceAll") { replaceAll_(payload); return json_({ ok: true, data: { saved: true, at: new Date().toISOString() } }); }
    if (action === "upsert") { upsert_(payload.collection, payload.record); return json_({ ok: true, data: payload.record }); }
    if (action === "remove") { remove_(payload.collection, payload.id); return json_({ ok: true, data: { removed: payload.id } }); }
    return json_({ ok: false, error: "Unknown action: " + action });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(col) {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(TAB[col]);
  if (!sh) sh = ss.insertSheet(TAB[col]);
  return sh;
}

function readAll_() {
  var out = {};
  COLLECTIONS.forEach(function (col) { out[col] = readCollection_(col); });
  return out;
}

function readCollection_(col) {
  var sh = sheet_(col);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  var keys = values[0];
  return values.slice(1).filter(function (r) { return r.join("") !== ""; }).map(function (r) {
    var o = {};
    keys.forEach(function (k, i) {
      var v = r[i];
      if (v instanceof Date) v = v.toISOString();
      if (typeof v === "string" && (v.charAt(0) === "[" || v.charAt(0) === "{")) { try { v = JSON.parse(v); } catch (e) { /* keep */ } }
      if (v === "true") v = true; if (v === "false") v = false;
      o[k] = v === "" ? null : v;
    });
    return o;
  });
}

function replaceAll_(data) {
  COLLECTIONS.forEach(function (col) {
    var records = data[col] || [];
    var sh = sheet_(col);
    sh.clearContents();
    if (!records.length) return;
    var keys = [];
    records.forEach(function (r) { Object.keys(r).forEach(function (k) { if (keys.indexOf(k) < 0) keys.push(k); }); });
    var rows = [keys].concat(records.map(function (r) {
      return keys.map(function (k) {
        var v = r[k];
        if (v === null || v === undefined) return "";
        return typeof v === "object" ? JSON.stringify(v) : v;
      });
    }));
    sh.getRange(1, 1, rows.length, keys.length).setValues(rows);
    sh.setFrozenRows(1);
  });
}

function upsert_(col, record) {
  var list = readCollection_(col);
  var idx = -1;
  list.forEach(function (r, i) { if (r.id === record.id) idx = i; });
  if (idx >= 0) list[idx] = record; else list.unshift(record);
  var data = {}; data[col] = list;
  var sh = sheet_(col); sh.clearContents();
  replaceAll_(data);
}

function remove_(col, id) {
  var list = readCollection_(col).filter(function (r) { return r.id !== id; });
  var data = {}; data[col] = list;
  replaceAll_(data);
}

/* ---------- Daily digest: today's and overdue tasks, emailed to the team ---------- */
function installDailyDigest() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === "sendDailyDigest") ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger("sendDailyDigest").timeBased().everyDays(1).atHour(7).nearMinute(30).create();
}

function sendDailyDigest() {
  var data = readAll_();
  var contacts = {};
  data.contacts.forEach(function (c) { contacts[c.id] = c; });
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var tomorrow = new Date(today.getTime() + 86400000);
  var due = [], overdue = [];
  data.tasks.forEach(function (t) {
    if (t.done) return;
    var d = new Date(t.due);
    var c = contacts[t.contactId] || {};
    var line = "- " + t.type + " · " + (c.company || "") + " (" + (c.name || "") + ") · " + Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM HH:mm");
    if (d >= today && d < tomorrow) due.push(line); else if (d < today) overdue.push(line);
  });
  var open = data.deals.filter(function (d) { return d.stage !== "Won" && d.stage !== "Lost"; }).length;
  var body = "Club of Mozambique CRM - daily digest\n\n" +
    "Tasks due today (" + due.length + "):\n" + (due.join("\n") || "- none") + "\n\n" +
    "Overdue (" + overdue.length + "):\n" + (overdue.join("\n") || "- none") + "\n\n" +
    "Open deals in pipeline: " + open + "\n\n" +
    "Sheet: " + SpreadsheetApp.getActive().getUrl();
  MailApp.sendEmail(DIGEST_TO, "CRM digest - " + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "d MMM"), body);
}
