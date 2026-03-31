/**
 * CONNECT THE FORM:
 *
 * This URL is your **Web app deployment** from Apps Script (Deploy → Web app).
 * It does **not** get pasted inside the Sheet UI — it belongs here so the website
 * can POST emails to your script. The script is already linked to the Sheet via
 * Extensions → Apps Script.
 *
 * Org / Workspace URLs look like:
 *   https://script.google.com/a/macros/DOMAIN/s/.../exec
 *
 * For a **public** GitHub Pages site, deployment must allow anonymous access
 * (“Anyone” / anyone with the link), or visitors will hit a login page (Okta).
 */
window.SHEETS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwhC6tLKHrDjeXQnhSlWURHERRLirEMVH2i_ymCPoce7lqer_bgbgrieAQYIhw6jVe12A/exec";
