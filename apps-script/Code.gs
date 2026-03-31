/**
 * Web app for Afikoman email capture.
 * Accepts POST as JSON { "email": "..." } or form field "email".
 *
 * Sheet: row 1 = Timestamp | Email
 */

var HEADER_ROW = 1;
var COL_TIMESTAMP = 1;
var COL_EMAIL = 2;

/** Opening the /exec URL in a browser uses GET — avoids "doGet not found" if you paste this project. */
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({
      ok: true,
      message:
        "Afikoman endpoint is live. Submissions use POST with JSON {\"email\":\"...\"} from your site.",
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ensureHeaders_(sheet);

    var email = parseEmailFromPost_(e);

    if (!email) {
      return jsonResponse_({ ok: false, error: "Missing email" });
    }

    if (!isValidEmail_(email)) {
      return jsonResponse_({ ok: false, error: "Invalid email" });
    }

    sheet.appendRow([new Date(), email]);
    sortSheetByTimestamp_(sheet);

    return jsonResponse_({ ok: true });
  } catch (err) {
    return jsonResponse_({ ok: false, error: String(err) });
  }
}

function parseEmailFromPost_(e) {
  if (e.postData && e.postData.contents) {
    var raw = String(e.postData.contents).trim();
    if (raw.indexOf("{") === 0) {
      var payload = JSON.parse(raw);
      return String(payload.email || "").trim();
    }
  }
  if (e.parameter && e.parameter.email) {
    return String(e.parameter.email).trim();
  }
  return "";
}

function ensureHeaders_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.getRange(HEADER_ROW, COL_TIMESTAMP, HEADER_ROW, COL_EMAIL).setValues([
      ["Timestamp", "Email"],
    ]);
    sheet.getRange(HEADER_ROW, COL_TIMESTAMP, HEADER_ROW, COL_EMAIL).setFontWeight("bold");
    return;
  }
  var a1 = sheet.getRange(HEADER_ROW, COL_TIMESTAMP).getValue();
  if (a1 === "" || a1 === null) {
    sheet.getRange(HEADER_ROW, COL_TIMESTAMP, HEADER_ROW, COL_EMAIL).setValues([
      ["Timestamp", "Email"],
    ]);
    sheet.getRange(HEADER_ROW, COL_TIMESTAMP, HEADER_ROW, COL_EMAIL).setFontWeight("bold");
  }
}

function sortSheetByTimestamp_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= HEADER_ROW + 1) {
    return;
  }
  var range = sheet.getRange(HEADER_ROW + 1, COL_TIMESTAMP, lastRow, COL_EMAIL);
  range.sort([{ column: 1, ascending: true }]);
}

function isValidEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
