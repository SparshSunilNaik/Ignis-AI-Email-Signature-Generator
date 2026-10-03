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
- Resets to Sparsh’s default Ignis profile values

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

## 3. How to set `HOSTED_LOGO_URL`

Open `script.js`. Near the top you will find:

```js
const HOSTED_LOGO_URL = "";
```

After you host `image.png` (for example on GitHub Pages), set:

```js
const HOSTED_LOGO_URL = "https://YOUR_USERNAME.github.io/Ignis-AI-Email-Signature-Generator/image.png";
```

Use your real Pages URL. Keep the constant easy to find — do not bury it.

## 4. Why the logo must be hosted for real email signatures

The live preview can load `./image.png` from this project.

Copied HTML signatures cannot reliably reference a local file on a teammate’s machine. When a recipient opens the email, their client needs an absolute `https://…` image URL.

Until `HOSTED_LOGO_URL` is set:

- Preview still works with the local logo
- A warning appears in the UI
- Copied HTML will still point at `./image.png`, which will **not** display for recipients

Do **not** paste a huge base64 logo into the copied HTML.

## 5. How to deploy with GitHub Pages

Repository (example): [Ignis-AI-Email-Signature-Generator](https://github.com/SparshSunilNaik/Ignis-AI-Email-Signature-Generator)

1. Push these files to the repository root (or `/docs`):
   - `index.html`
   - `styles.css`
   - `script.js`
   - `image.png`
   - `README.md`
2. On GitHub: **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `main` (or `master`), folder: `/ (root)` — or `/docs` if you placed files there
5. Save and wait for the site to publish
6. Site URL will look like:

```text
https://sparshsunilnaik.github.io/Ignis-AI-Email-Signature-Generator/
```

7. Set `HOSTED_LOGO_URL` to:

```text
https://sparshsunilnaik.github.io/Ignis-AI-Email-Signature-Generator/image.png
```

All asset paths are relative (`./styles.css`, `./script.js`, `./image.png`) so the app works from a project subdirectory.

## 6. How to create a signature

1. Enter **Full name**, **Role / position**, and **Ignis email** (required).
2. Optionally add qualifications, phone, ABN, website label, and location.
3. Choose logo size: Small / Standard / Large.
4. Use the optional-line toggles when those fields have values.
5. Review the live preview on the right.
6. Click **Copy signature**.

Blank optional fields are omitted entirely — no empty rows.

## 7. How to paste into Gmail

1. Click **Copy signature** in this tool.
2. In Gmail: **Settings (gear) → See all settings → General → Signature**.
3. Create or edit a signature.
4. Paste into the signature editor (`Cmd/Ctrl + V`).
5. Save changes at the bottom of the page.
6. Compose a test email to yourself and confirm the logo + links.

If the logo is missing in the sent email, `HOSTED_LOGO_URL` is empty or incorrect.

### Outlook / Apple Mail

Same idea: paste the copied signature into the client’s signature settings. Prefer **Copy signature** (HTML + plain) over **Copy HTML** unless the client asks for raw markup.

## 8. How to export PNG

1. Serve the site over `http://` or `https://` (local server or GitHub Pages).
2. Click **Export PNG**.
3. A 3× resolution PNG downloads, named like:

```text
Ignis_Sparsh_Sunil_Naik_EmailSignature.png
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
- Local `./image.png` paths will not work for recipients — always set `HOSTED_LOGO_URL` for production.
- Gmail may slightly adjust spacing; that is normal.
