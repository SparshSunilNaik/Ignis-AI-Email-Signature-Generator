# Ignis Email Signature Generator

Internal static tool for Ignis AI team members to create a consistent, email-client-safe signature, then copy it into Gmail (or another client), or export it as PNG / PDF for reference.

No backend, database, authentication, API keys, or build step. Everything runs in the browser.

## 1. What the tool does

- Collects team member details (name, role, email, optional qualifications, phone, ABN, website, location)
- Renders a live preview of an Ignis email signature
- Copies an email-safe HTML + plain-text signature to the clipboard
- Copies raw HTML source for technical email clients
- Exports a high-resolution PNG of the signature only
- Exports a compact PDF (with Print / Save as PDF fallback)
- Resets to empty personal fields with the company ABN and website defaults

## 2. How to run locally

### Option A — open the file

1. Open `index.html` in a modern browser (Chrome, Edge, Safari, Firefox).
2. Fill in the form — the preview updates immediately.
3. Use **Copy signature** for email clients.

> Note: **Export PNG / PDF** may fail when the page is opened via `file://` because browsers restrict canvas capture of local images. Use Option B or GitHub Pages for reliable exports.

### Option B — local static server (recommended for exports)

From this folder:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

## 3. Hosted logo URL

`script.js` sets:

```js
const HOSTED_LOGO_URL =
  "https://sparshsunilnaik.github.io/Ignis-AI-Email-Signature-Generator/image.png";
```

Live preview and copied HTML signatures use this absolute URL so email clients can load the Ignis logo.

PNG/PDF export uses the local `./image.png` asset for reliable canvas capture.

If you move hosting, update `HOSTED_LOGO_URL` near the top of `script.js`.

## 4. Why the logo must be hosted for real email signatures

Copied HTML signatures cannot reliably reference a local file on a teammate’s machine. Recipients need an absolute `https://…` image URL.

Do **not** paste a huge base64 logo into the copied HTML.

## 5. How to deploy with GitHub Pages

Repository: [Ignis-AI-Email-Signature-Generator](https://github.com/SparshSunilNaik/Ignis-AI-Email-Signature-Generator)

1. Push these files to the repository root:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `image.png`
   - `README.md`
2. On GitHub: **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main`, folder: `/ (root)`
5. Save and wait for the site to publish
6. Site URL:

```text
https://sparshsunilnaik.github.io/Ignis-AI-Email-Signature-Generator/
```

All asset paths are relative (`./styles.css`, `./script.js`, `./image.png`) so the app works from a project subdirectory.

## 6. How to create a signature

1. Enter **Full name**, **Role / position**, and **Ignis email**.
2. Optionally add qualifications, phone, and location.
3. Confirm the company ABN (`13 131 623 927` by default) and website (`ignisai.au`).
4. Choose logo size: Small / Standard / Large.
5. Use the optional-line toggles when those fields have values.
6. Review the live preview on the right.
7. Click **Copy signature**.

Blank personal fields are omitted entirely — no empty rows. Placeholders never appear in the generated signature.

## 7. How to paste into Gmail

1. Click **Copy signature** in this tool.
2. In Gmail: **Settings (gear) → See all settings → General → Signature**.
3. Create or edit a signature.
4. Paste into the signature editor (`Cmd/Ctrl + V`).
5. Save changes at the bottom of the page.
6. Compose a test email to yourself and confirm the logo + links.

### Outlook / Apple Mail

Same idea: paste the copied signature into the client’s signature settings. Prefer **Copy signature** (HTML + plain) over **Copy HTML** unless the client asks for raw markup.

## 8. How to export PNG

1. Serve the site over `http://` or `https://` (local server or GitHub Pages).
2. Click **Export PNG**.
3. A 3× resolution PNG downloads, named like:

```text
Ignis_FirstName_LastName_EmailSignature.png
```

Only the signature is exported — not the generator UI.

PNG/PDF export loads [html2canvas](https://html2canvas.hertzen.com/) (and [jsPDF](https://github.com/parallax/jsPDF) for PDF) from jsDelivr **only when you click export**. Copy Signature does not depend on those libraries.

## 9. How to add new optional fields later

1. Add a labelled input in `index.html`.
2. Read it in `getFormState()` inside `script.js`.
3. Render a new row in `buildSignatureHtml()` / `buildPlainText()` **only when the value is non-empty**.
4. Optionally add a show/hide toggle, disabled when the field is blank.
5. Keep signature markup as a `<table role="presentation">` with **inline styles** and Arial — no Grid/Flex inside the signature.

## 10. Brand colours

| Token        | Hex       |
| ------------ | --------- |
| Coral        | `#E8483D` |
| Deep Coral   | `#C93227` |
| Ink          | `#1C1210` |
| Paper        | `#FDFAF8` |
| Blush        | `#FFF6F3` |
| Brown        | `#514542` |
| Muted        | `#7A6F6D` |
| White        | `#FFFFFF` |
| Lines        | `#E2D2CD` |
| Subtle lines | `#EEE2DE` |

**UI typography:** system / SF Pro stack  
**Signature typography:** `Arial, Helvetica, sans-serif` only

## Logo asset

Use `image.png` exactly as supplied. Do not redraw, recolour, crop, stretch, or replace it. Preview and exports use `object-fit: contain` and preserve aspect ratio.

## Privacy

All processing is client-side. Form data never leaves the browser. No analytics or remote form posts.

## Email-client limitations

- Some clients strip or rewrite HTML; keep the signature table simple.
- Images may be blocked until the recipient allows them.
- Dark-mode clients may invert colours unexpectedly.
- Gmail may slightly adjust spacing; that is normal.
