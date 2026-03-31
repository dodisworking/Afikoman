/**
 * Smoke-test the Apps Script Web App (same POST as the browser).
 * Usage:
 *   node scripts/test-sheets.mjs
 *   WEBAPP_URL=https://script.google.com/macros/s/.../exec node scripts/test-sheets.mjs
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = join(__dirname, "..", "config.js");

let url = process.env.WEBAPP_URL?.trim() || "";

if (!url) {
  const raw = readFileSync(configPath, "utf8");
  const m = raw.match(/SHEETS_ENDPOINT\s*=\s*["']([^"']*)["']/);
  url = (m && m[1] ? m[1] : "").trim();
}

if (!url) {
  console.error(
    "No Web App URL: set SHEETS_ENDPOINT in config.js, or run:\n" +
      "  WEBAPP_URL=https://script.google.com/macros/s/.../exec node scripts/test-sheets.mjs"
  );
  process.exit(1);
}

const body = JSON.stringify({ email: "sheet-test@example.com" });

const res = await fetch(url, {
  method: "POST",
  redirect: "follow",
  credentials: "omit",
  headers: {
    "Content-Type": "text/plain;charset=utf-8",
  },
  body,
});

const text = await res.text();
console.log("HTTP", res.status);
console.log("Body:", text);

let data;
try {
  data = JSON.parse(text);
} catch {
  data = null;
}

if (res.ok && data && data.ok === true) {
  console.log("\nOK: row should appear in your Sheet (check Timestamp + Email).");
  process.exit(0);
}

console.error("\nFAIL: expected { ok: true } with HTTP 200.");
process.exit(1);
