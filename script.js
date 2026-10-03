/**
 * Ignis Email Signature Generator
 * Static client-side tool — no backend, no data leaves the browser.
 */

/* ============================================================
 * HOSTED LOGO URL — absolute HTTPS URL for email clients
 * ============================================================ */
const HOSTED_LOGO_URL =
  "https://sparshsunilnaik.github.io/Ignis-AI-Email-Signature-Generator/image.png";

const LOCAL_LOGO_PATH = "./image.png";
const WEBSITE_HREF = "https://ignisai.au/";
const COMPANY_NAME = "Ignis AI";
const COMPANY_WEBSITE_LABEL = "ignisai.au";
const DEFAULT_ABN = "13 131 623 927";

const LOGO_WIDTHS = {
  small: 90,
  standard: 110,
  large: 130,
};

const DEFAULTS = {
  fullName: "",
  role: "",
  email: "",
  qualifications: "",
  phone: "",
  abn: DEFAULT_ABN,
  website: COMPANY_WEBSITE_LABEL,
  location: "",
  logoSize: "standard",
};

const REQUIRED_ELS = [
  "form",
  "preview",
  "copyMount",
  "status",
  "fullName",
  "role",
  "email",
  "qualifications",
  "phone",
  "abn",
  "website",
  "location",
  "showPhone",
  "showQualifications",
  "showAbn",
  "showLocation",
  "btnCopy",
  "btnCopyHtml",
  "btnExportPng",
  "btnExportPdf",
  "btnReset",
];

/** @type {Record<string, HTMLElement|null>} */
var els = {};
var userHasInteracted = false;
var autofillGuardDone = false;

function resolveElements() {
  els = {
    form: document.getElementById("signature-form"),
    preview: document.getElementById("signature-preview"),
    copyMount: document.getElementById("copy-mount"),
    status: document.getElementById("status"),
    fullName: document.getElementById("fullName"),
    role: document.getElementById("role"),
    email: document.getElementById("email"),
    qualifications: document.getElementById("qualifications"),
    phone: document.getElementById("phone"),
    abn: document.getElementById("abn"),
    website: document.getElementById("website"),
    location: document.getElementById("location"),
    showPhone: document.getElementById("showPhone"),
    showQualifications: document.getElementById("showQualifications"),
    showAbn: document.getElementById("showAbn"),
    showLocation: document.getElementById("showLocation"),
    btnCopy: document.getElementById("btn-copy"),
    btnCopyHtml: document.getElementById("btn-copy-html"),
    btnExportPng: document.getElementById("btn-export-png"),
    btnExportPdf: document.getElementById("btn-export-pdf"),
    btnReset: document.getElementById("btn-reset"),
  };

  var missing = [];
  REQUIRED_ELS.forEach(function (key) {
    if (!els[key]) missing.push(key);
  });

  if (missing.length) {
    console.error(
      "Ignis signature generator: missing required DOM elements:",
      missing.join(", ")
    );
    return false;
  }
  return true;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function trimValue(value) {
  return String(value || "").trim();
}

function getLogoSize() {
  const selected = els.form.querySelector('input[name="logoSize"]:checked');
  return selected ? selected.value : "standard";
}

function formatAbnDisplay(abn) {
  const trimmed = trimValue(abn);
  if (!trimmed) return "";
  const withoutPrefix = trimmed.replace(/^ABN\s+/i, "").trim();
  if (!withoutPrefix) return "";
  return "ABN " + withoutPrefix;
}

function getFormState() {
  const fullName = trimValue(els.fullName.value);
  const role = trimValue(els.role.value);
  const email = trimValue(els.email.value);
  const qualifications = trimValue(els.qualifications.value);
  const phone = trimValue(els.phone.value);
  const abn = trimValue(els.abn.value);
  const location = trimValue(els.location.value);

  return {
    fullName: fullName,
    role: role,
    email: email,
    qualifications: qualifications,
    phone: phone,
    abn: abn,
    website: trimValue(els.website.value) || COMPANY_WEBSITE_LABEL,
    location: location,
    logoSize: getLogoSize(),
    showName: Boolean(fullName),
    showRole: Boolean(role),
    showEmail: Boolean(email),
    showPhone: els.showPhone.checked && Boolean(phone),
    showQualifications: els.showQualifications.checked && Boolean(qualifications),
    showAbn: els.showAbn.checked && Boolean(abn),
    showLocation: els.showLocation.checked && Boolean(location),
  };
}

function getLogoSrc() {
  if (HOSTED_LOGO_URL) {
    return HOSTED_LOGO_URL;
  }
  return LOCAL_LOGO_PATH;
}

function logoHeightForWidth(width) {
  // image.png is 1046 × 866 — preserve aspect ratio
  return Math.round(width * (866 / 1046));
}

function telHref(phone) {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return "tel:" + cleaned;
}

function buildPlainText(state) {
  const lines = [];
  if (state.showName) lines.push(state.fullName);
  if (state.showRole) lines.push(state.role + ", " + COMPANY_NAME);
  if (state.showQualifications) lines.push(state.qualifications);
  if (state.showEmail || state.showPhone || state.website) {
    if (lines.length) lines.push("");
    if (state.showEmail) lines.push(state.email);
    if (state.showPhone) lines.push(state.phone);
    lines.push(WEBSITE_HREF.replace(/\/$/, ""));
  }
  if (state.showLocation || state.showAbn) {
    lines.push("");
    if (state.showLocation) lines.push(state.location);
    if (state.showAbn) lines.push(formatAbnDisplay(state.abn));
  }
  return lines.join("\n");
}

/**
 * Build email-safe table signature with inline styles only.
 * @param {object} state
 * @param {{ forClipboard?: boolean, forExport?: boolean }} options
 */
function buildSignatureHtml(state, options) {
  options = options || {};
  const forExport = Boolean(options.forExport);

  const logoWidth = LOGO_WIDTHS[state.logoSize] || LOGO_WIDTHS.standard;
  const logoHeight = logoHeightForWidth(logoWidth);
  // Preview + copied HTML use the hosted logo; PNG/PDF export uses the local asset.
  const logoSrc = forExport ? LOCAL_LOGO_PATH : getLogoSrc();

  const websiteLabel = escapeHtml(
    state.website.replace(/^https?:\/\//i, "").replace(/\/$/, "")
  );

  let contactRows = "";
  let wroteIdentity = false;

  if (state.showName) {
    contactRows +=
      '<div style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:600; line-height:1.35; color:#1C1210; margin:0 0 2px 0;">' +
      escapeHtml(state.fullName) +
      "</div>";
    wroteIdentity = true;
  }

  if (state.showRole) {
    contactRows +=
      '<div style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:400; line-height:1.35; color:#514542; margin:0 0 2px 0;">' +
      escapeHtml(state.role) +
      ", " +
      escapeHtml(COMPANY_NAME) +
      "</div>";
    wroteIdentity = true;
  }

  if (state.showQualifications) {
    contactRows +=
      '<div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:400; line-height:1.35; color:#7A6F6D; margin:0 0 2px 0;">' +
      escapeHtml(state.qualifications) +
      "</div>";
    wroteIdentity = true;
  }

  if (wroteIdentity) {
    contactRows +=
      '<div style="height:10px; line-height:10px; font-size:10px;">&nbsp;</div>';
  }

  if (state.showEmail) {
    const email = escapeHtml(state.email);
    contactRows +=
      '<div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:1.45; margin:0 0 2px 0;">' +
      '<a href="mailto:' +
      email +
      '" style="color:#C93227; text-decoration:none; font-family:Arial, Helvetica, sans-serif;">' +
      email +
      "</a></div>";
  }

  if (state.showPhone) {
    contactRows +=
      '<div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:1.45; margin:0 0 2px 0;">' +
      '<a href="' +
      escapeHtml(telHref(state.phone)) +
      '" style="color:#C93227; text-decoration:none; font-family:Arial, Helvetica, sans-serif;">' +
      escapeHtml(state.phone) +
      "</a></div>";
  }

  contactRows +=
    '<div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:1.45; margin:0 0 2px 0;">' +
    '<a href="' +
    WEBSITE_HREF +
    '" style="color:#C93227; text-decoration:none; font-family:Arial, Helvetica, sans-serif;" target="_blank" rel="noopener noreferrer">' +
    websiteLabel +
    "</a></div>";

  if (state.showLocation || state.showAbn) {
    contactRows +=
      '<div style="height:10px; line-height:10px; font-size:10px;">&nbsp;</div>';
  }

  if (state.showLocation) {
    contactRows +=
      '<div style="font-family:Arial, Helvetica, sans-serif; font-size:12px; font-weight:400; line-height:1.35; color:#514542; margin:0 0 2px 0;">' +
      escapeHtml(state.location) +
      "</div>";
  }

  if (state.showAbn) {
    contactRows +=
      '<div style="font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:400; line-height:1.35; color:#7A6F6D; margin:0;">' +
      escapeHtml(formatAbnDisplay(state.abn)) +
      "</div>";
  }

  return (
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; border-spacing:0; mso-table-lspace:0pt; mso-table-rspace:0pt;">' +
    "<tr>" +
    '<td valign="middle" style="padding:0 20px 0 0; vertical-align:middle;">' +
    '<img src="' +
    escapeHtml(logoSrc) +
    '" width="' +
    logoWidth +
    '" height="' +
    logoHeight +
    '" alt="Ignis AI" style="display:block; border:0; outline:none; text-decoration:none; width:' +
    logoWidth +
    "px; height:" +
    logoHeight +
    'px; object-fit:contain;" />' +
    "</td>" +
    '<td width="1" valign="middle" style="width:1px; border-left:1px solid #E2D2CD; padding:0; font-size:0; line-height:0;">&nbsp;</td>' +
    '<td valign="middle" style="padding:0 0 0 20px; vertical-align:middle;">' +
    contactRows +
    "</td>" +
    "</tr>" +
    "</table>"
  );
}

function updateToggleStates() {
  const pairs = [
    { input: els.phone, toggle: els.showPhone },
    { input: els.qualifications, toggle: els.showQualifications },
    { input: els.abn, toggle: els.showAbn },
    { input: els.location, toggle: els.showLocation },
  ];

  pairs.forEach(function (pair) {
    if (!pair.input || !pair.toggle) return;

    const hasValue = Boolean(trimValue(pair.input.value));
    const label = pair.toggle.closest(".toggle");
    const wasDisabled = pair.toggle.disabled;

    pair.toggle.disabled = !hasValue;
    if (label) {
      label.classList.toggle("is-disabled", !hasValue);
    }

    if (!hasValue) {
      pair.toggle.checked = false;
    } else if (wasDisabled) {
      // Field regained a value — show the line by default; user can still untick.
      pair.toggle.checked = true;
    }
  });
}

function setStatus(message, type) {
  if (!els.status) return;
  els.status.textContent = message || "";
  els.status.classList.remove("is-success", "is-error");
  if (type === "success") els.status.classList.add("is-success");
  if (type === "error") els.status.classList.add("is-error");
}

function renderPreview() {
  if (!els.preview) {
    console.error("Ignis signature generator: preview element missing");
    return;
  }
  try {
    updateToggleStates();
    const state = getFormState();
    els.preview.innerHTML = buildSignatureHtml(state, { forClipboard: false });
  } catch (err) {
    console.error("Ignis signature generator: failed to render preview", err);
  }
}

async function copyWithClipboardItem(html, plain) {
  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    return false;
  }
  try {
    const item = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plain], { type: "text/plain" }),
    });
    await navigator.clipboard.write([item]);
    return true;
  } catch (err) {
    return false;
  }
}

function copyWithExecCommand(html, plain) {
  const mount = els.copyMount;
  mount.innerHTML = "";

  const container = document.createElement("div");
  container.contentEditable = "true";
  container.innerHTML = html;
  mount.appendChild(container);

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(container);
  selection.removeAllRanges();
  selection.addRange(range);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (err) {
    ok = false;
  }

  selection.removeAllRanges();
  mount.innerHTML = "";

  if (!ok && navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(plain).then(function () {
      return true;
    });
  }

  return Promise.resolve(ok);
}

async function copySignature() {
  const state = getFormState();
  const html = buildSignatureHtml(state, { forClipboard: true });
  const plain = buildPlainText(state);

  let ok = await copyWithClipboardItem(html, plain);
  if (!ok) {
    ok = await copyWithExecCommand(html, plain);
  }

  if (ok) {
    setStatus(
      "Signature copied. Paste it into your email signature settings.",
      "success"
    );
  } else {
    setStatus("Could not copy signature. Try Copy HTML instead.", "error");
  }
}

async function copyHtmlSource() {
  const state = getFormState();
  const html = buildSignatureHtml(state, { forClipboard: true });

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(html);
    } else {
      const ok = await copyWithExecCommand(
        "<pre>" + escapeHtml(html) + "</pre>",
        html
      );
      if (!ok) throw new Error("copy failed");
    }
    setStatus("HTML source copied to clipboard.", "success");
  } catch (err) {
    setStatus("Could not copy HTML source.", "error");
  }
}

function filenameBase(state) {
  const parts = state.fullName
    .split(/\s+/)
    .filter(Boolean)
    .map(function (part) {
      return part.replace(/[^A-Za-z0-9_-]/g, "");
    })
    .filter(Boolean);
  const namePart = parts.length ? parts.join("_") : "Team_Member";
  return "Ignis_" + namePart + "_EmailSignature";
}

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    const existing = document.querySelector('script[data-export-lib="' + src + '"]');
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", function () {
        resolve();
      });
      existing.addEventListener("error", function () {
        reject(new Error("Failed to load " + src));
      });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.exportLib = src;
    script.onload = function () {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = function () {
      reject(new Error("Failed to load " + src));
    };
    document.head.appendChild(script);
  });
}

async function ensureHtml2Canvas() {
  if (window.html2canvas) return window.html2canvas;
  await loadScript(
    "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"
  );
  if (!window.html2canvas) throw new Error("html2canvas unavailable");
  return window.html2canvas;
}

async function ensureJsPdf() {
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  await loadScript(
    "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js"
  );
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error("jsPDF unavailable");
  }
  return window.jspdf.jsPDF;
}

function createExportNode(state) {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "position:fixed; left:-10000px; top:0; background:#FFFFFF; padding:24px; display:inline-block;";
  wrap.innerHTML = buildSignatureHtml(state, { forExport: true });
  document.body.appendChild(wrap);
  return wrap;
}

async function renderSignatureCanvas(scale) {
  const state = getFormState();
  const html2canvas = await ensureHtml2Canvas();
  const node = createExportNode(state);

  try {
    const canvas = await html2canvas(node, {
      backgroundColor: "#FFFFFF",
      scale: scale || 3,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 15000,
    });
    return { canvas: canvas, state: state };
  } finally {
    if (node.parentNode) node.parentNode.removeChild(node);
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);
}

async function exportPng() {
  setStatus("Preparing PNG…");
  try {
    const result = await renderSignatureCanvas(3);
    await new Promise(function (resolve, reject) {
      result.canvas.toBlob(
        function (blob) {
          if (!blob) {
            reject(new Error("PNG encoding failed"));
            return;
          }
          downloadBlob(blob, filenameBase(result.state) + ".png");
          resolve();
        },
        "image/png"
      );
    });
    setStatus("PNG downloaded.", "success");
  } catch (err) {
    console.error(err);
    setStatus(
      "PNG export failed. Serve the site over http(s) (not file://) so the logo can be captured, then try again.",
      "error"
    );
  }
}

async function exportPdf() {
  setStatus("Preparing PDF…");
  try {
    const JsPDF = await ensureJsPdf();
    const result = await renderSignatureCanvas(3);
    const canvas = result.canvas;
    const imgData = canvas.toDataURL("image/png");

    // Compact page sized around the signature (CSS pixels at 96dpi ≈ mm)
    const paddingMm = 8;
    const widthMm = (canvas.width / 3) * 0.264583 + paddingMm * 2;
    const heightMm = (canvas.height / 3) * 0.264583 + paddingMm * 2;

    const pdf = new JsPDF({
      orientation: widthMm >= heightMm ? "landscape" : "portrait",
      unit: "mm",
      format: [widthMm, heightMm],
      compress: true,
    });

    pdf.addImage(
      imgData,
      "PNG",
      paddingMm,
      paddingMm,
      widthMm - paddingMm * 2,
      heightMm - paddingMm * 2
    );
    pdf.save(filenameBase(result.state) + ".pdf");
    setStatus("PDF downloaded.", "success");
  } catch (err) {
    console.error(err);
    // Reliable fallback: print / Save as PDF with signature only
    openPrintFallback();
  }
}

function openPrintFallback() {
  const state = getFormState();
  const html = buildSignatureHtml(state, { forExport: true });
  const win = window.open("", "_blank");
  if (!win) {
    setStatus(
      "PDF export failed and the print window was blocked. Allow pop-ups or try Export PNG.",
      "error"
    );
    return;
  }
  win.document.write(
    "<!DOCTYPE html><html><head><title>" +
      escapeHtml(filenameBase(state)) +
      '</title><style>@page{margin:12mm;}body{margin:0;padding:24px;background:#fff;font-family:Arial,Helvetica,sans-serif;}img{display:block;}</style></head><body>' +
      html +
      "<script>window.onload=function(){window.focus();window.print();}<\\/script></body></html>"
  );
  win.document.close();
  setStatus(
    "Print dialog opened. Choose “Save as PDF” to export a compact PDF of the signature.",
    "success"
  );
}

function applyDefaultState() {
  els.fullName.value = DEFAULTS.fullName;
  els.role.value = DEFAULTS.role;
  els.email.value = DEFAULTS.email;
  els.qualifications.value = DEFAULTS.qualifications;
  els.phone.value = DEFAULTS.phone;
  els.abn.value = DEFAULTS.abn;
  els.website.value = DEFAULTS.website;
  els.location.value = DEFAULTS.location;

  const standard = els.form.querySelector('input[name="logoSize"][value="standard"]');
  if (standard) standard.checked = true;

  els.showPhone.checked = true;
  els.showQualifications.checked = true;
  els.showAbn.checked = true;
  els.showLocation.checked = true;
}

function resetForm() {
  userHasInteracted = true;
  applyDefaultState();
  renderPreview();
  setStatus("Form reset to defaults.", "success");
}

function markUserInteraction() {
  userHasInteracted = true;
}

/**
 * Prevent aggressive browser profile autofill from restoring old personal
 * contact details into this generator. Readonly until first focus; removed once.
 */
function installAutofillGuards() {
  var personalFields = [
    els.fullName,
    els.role,
    els.email,
    els.qualifications,
    els.phone,
    els.location,
  ];

  personalFields.forEach(function (field) {
    if (!field) return;
    field.setAttribute("readonly", "readonly");
    field.addEventListener(
      "focus",
      function () {
        field.removeAttribute("readonly");
      },
      { once: true }
    );
  });
}

/**
 * One-time correction after browsers that autofill after scripts run.
 * Stops as soon as the user interacts with the form.
 */
function scheduleAutofillCorrection() {
  if (autofillGuardDone) return;
  window.setTimeout(function () {
    if (userHasInteracted) {
      autofillGuardDone = true;
      return;
    }
    applyDefaultState();
    renderPreview();
    autofillGuardDone = true;
  }, 50);
}

function bindEvents() {
  els.form.addEventListener("input", function () {
    markUserInteraction();
    renderPreview();
  });
  els.form.addEventListener("change", function () {
    markUserInteraction();
    renderPreview();
  });

  els.btnCopy.addEventListener("click", function () {
    markUserInteraction();
    copySignature();
  });
  els.btnCopyHtml.addEventListener("click", function () {
    markUserInteraction();
    copyHtmlSource();
  });
  els.btnExportPng.addEventListener("click", function () {
    markUserInteraction();
    exportPng();
  });
  els.btnExportPdf.addEventListener("click", function () {
    markUserInteraction();
    exportPdf();
  });
  els.btnReset.addEventListener("click", function () {
    resetForm();
  });
}

function init() {
  if (!resolveElements()) return;

  // No localStorage / sessionStorage / query-param restore by design.
  applyDefaultState();
  installAutofillGuards();
  bindEvents();
  renderPreview();
  scheduleAutofillCorrection();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
