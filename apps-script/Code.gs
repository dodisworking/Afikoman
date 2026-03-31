/**
 * Web app endpoint for the static site (POST JSON: { "email": "..." }).
 * Bound to your spreadsheet — rows append to the active sheet.
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var email = String(payload.email || "").trim();
    if (!email) {
      return jsonResponse({ ok: false, error: "Missing email" });
    }
    sheet.appendRow([new Date(), email]);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
