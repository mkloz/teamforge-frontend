#!/usr/bin/env node
// @ts-check

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const OUTPUT_DIR = path.join(ROOT_DIR, "public", "download");
const FONT_PATH = path.join(
  ROOT_DIR,
  "node_modules",
  "@fontsource-variable",
  "source-sans-3",
  "files",
  "source-sans-3-latin-wght-normal.woff2",
);
const LOGO_PATH = path.join(ROOT_DIR, "public", "favicon.svg");
const CHECK_MODE = process.argv.includes("--check");

const COLORS = {
  amber: "#F59E0B",
  background: "#06110F",
  border: "#33403E",
  ink: "#F5F5F3",
  muted: "#939B99",
  quiet: "#222C2A",
  surface: "#111A18",
  teal: "#14B8A6",
  tealDark: "#083C36",
};

const BASE_SPECS = [
  { fileName: "install-preview-ios.png", height: 647, kind: "ios", width: 984 },
  {
    fileName: "install-preview-android.png",
    height: 900,
    kind: "android",
    width: 465,
  },
  {
    fileName: "install-preview-desktop.png",
    height: 510,
    kind: "desktop",
    width: 815,
  },
];

const DERIVATIVE_SPECS = [
  {
    fileName: "install-preview-ios-720w.png",
    height: 473,
    source: "install-preview-ios.png",
    width: 720,
  },
  {
    fileName: "install-preview-ios-480w.png",
    height: 316,
    source: "install-preview-ios.png",
    width: 480,
  },
  {
    fileName: "install-preview-android-360w.png",
    height: 697,
    source: "install-preview-android.png",
    width: 360,
  },
  {
    fileName: "install-preview-android-256w.png",
    height: 495,
    source: "install-preview-android.png",
    width: 256,
  },
  {
    fileName: "install-preview-desktop-480w.png",
    height: 300,
    source: "install-preview-desktop.png",
    width: 480,
  },
];

const fontData = (await readFile(FONT_PATH)).toString("base64");
const logoData = (await readFile(LOGO_PATH)).toString("base64");

const browser = await chromium.launch({ headless: true });

try {
  const baseEntries = await Promise.all(BASE_SPECS.map(renderBasePreview));
  /** @type {Map<string, Buffer>} */
  const outputBuffers = new Map(baseEntries);
  const derivativeEntries = await Promise.all(
    DERIVATIVE_SPECS.map((spec) => renderDerivative(spec, outputBuffers)),
  );

  for (const entry of derivativeEntries) outputBuffers.set(...entry);

  await Promise.all(
    [...outputBuffers].map(([fileName, output]) =>
      verifyOrWriteOutput(fileName, output),
    ),
  );
} finally {
  await browser.close();
}

/** @param {(typeof BASE_SPECS)[number]} spec @returns {Promise<[string, Buffer]>} */
async function renderBasePreview(spec) {
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { height: spec.height, width: spec.width },
  });

  try {
    await page.setContent(buildDocument(spec), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const output = await page.screenshot({
      animations: "disabled",
      fullPage: false,
      omitBackground: false,
      type: "png",
    });
    return [spec.fileName, output];
  } finally {
    await page.close();
  }
}

/** @param {(typeof DERIVATIVE_SPECS)[number]} spec @param {ReadonlyMap<string, Buffer>} outputs @returns {Promise<[string, Buffer]>} */
async function renderDerivative(spec, outputs) {
  const source = outputs.get(spec.source);
  if (!source) throw new Error(`Missing rendered source ${spec.source}.`);
  const output = await sharp(source)
    .resize(spec.width, spec.height, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return [spec.fileName, output];
}

/** @param {string} fileName @param {Buffer} output */
async function verifyOrWriteOutput(fileName, output) {
  const target = path.join(OUTPUT_DIR, fileName);
  if (CHECK_MODE) {
    const current = await readFile(target);
    if (!current.equals(output)) {
      throw new Error(`${fileName} is stale; run npm run pwa:previews.`);
    }
  } else {
    await writeFile(target, output);
  }
  process.stdout.write(
    `${CHECK_MODE ? "Verified" : "Generated"}: ${fileName} (${sha256(output).slice(0, 12)})\n`,
  );
}

/** @param {{ height: number; kind: string; width: number }} spec */
function buildDocument(spec) {
  const illustration =
    spec.kind === "ios"
      ? buildIosPreview()
      : spec.kind === "android"
        ? buildAndroidPreview()
        : buildDesktopPreview();

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: "Source Sans 3 Preview"; font-style: normal; font-weight: 200 900; src: url(data:font/woff2;base64,${fontData}) format("woff2"); }
    * { box-sizing: border-box; }
    html, body { width: ${spec.width}px; height: ${spec.height}px; margin: 0; overflow: hidden; background: ${COLORS.background}; }
    svg { display: block; width: ${spec.width}px; height: ${spec.height}px; font-family: "Source Sans 3 Preview", "Segoe UI", sans-serif; }
    .amber { fill: ${COLORS.amber}; } .ink { fill: ${COLORS.ink}; } .muted { fill: ${COLORS.muted}; } .teal { fill: ${COLORS.teal}; }
    .label { font-size: 18px; font-weight: 620; } .body { font-size: 16px; font-weight: 470; }
  </style></head><body>${illustration}</body></html>`;
}

function buildIosPreview() {
  return `<svg viewBox="0 0 984 647" xmlns="http://www.w3.org/2000/svg">
    ${backgroundGradient("ios-bg", 984, 647)}
    ${browserBar({ address: "findafew.today/download", width: 984 })}
    ${logoTile(52, 166, 86)}
    ${text(162, 202, "Findafew", 34, 760)}
    ${text(162, 233, "Small groups for things you want to do.", 21, 500, "muted")}
    ${line(52, 282, 514, 282)}
    ${text(52, 335, "Add Findafew to", 39, 760)}
    ${text(52, 376, "your Home Screen.", 39, 760)}
    ${text(52, 421, "Install from Safari, then open it like a", 21, 500, "muted")}
    ${text(52, 448, "focused app.", 21, 500, "muted")}
    ${line(552, 157, 552, 488)}
    ${stepRow(593, 190, "01", "Open Share", "Use the Safari share button.", "share")}
    ${line(593, 274, 944, 274)}
    ${stepRow(593, 292, "02", "Add Findafew", "Choose Add to Home Screen.", "plus", true)}
    ${line(593, 376, 944, 376)}
    ${stepRow(593, 394, "03", "Open anytime", "Launch it from your apps.", "check")}
    <rect x="52" y="520" width="892" height="97" rx="18" fill="${COLORS.tealDark}" stroke="${COLORS.teal}" stroke-opacity=".65" stroke-width="2"/>
    <circle cx="105" cy="568" r="28" fill="${COLORS.teal}"/>${plusIcon(105, 568, 13)}
    ${text(155, 565, "Add to Home Screen", 27, 720)}
    ${text(155, 592, "Icon, name, and app view are ready.", 18, 500, "muted")}
    <rect x="833" y="542" width="88" height="52" rx="26" fill="${COLORS.teal}"/>${text(856, 576, "Add", 22, 720)}
  </svg>`;
}

function buildAndroidPreview() {
  return `<svg viewBox="0 0 465 900" xmlns="http://www.w3.org/2000/svg">
    ${backgroundGradient("android-bg", 465, 900)}
    ${statusBar(465)}
    <rect x="27" y="48" width="411" height="60" rx="30" fill="${COLORS.quiet}" stroke="${COLORS.border}" stroke-width="1.5"/>
    <circle cx="57" cy="78" r="9" fill="none" stroke="${COLORS.muted}" stroke-width="2"/>${text(82, 84, "findafew.today/download", 17, 510, "muted")}
    <circle cx="407" cy="70" r="2.5" fill="${COLORS.muted}"/><circle cx="407" cy="78" r="2.5" fill="${COLORS.muted}"/><circle cx="407" cy="86" r="2.5" fill="${COLORS.muted}"/>
    ${logoTile(148, 166, 169)}
    ${text(151, 386, "Findafew", 38, 760)}
    ${text(77, 421, "Small groups for things you want to do.", 18, 500, "muted")}
    ${line(41, 463, 424, 463)}
    ${text(41, 514, "Groups", 22, 610, "muted")}
    <rect x="321" y="492" width="103" height="41" rx="21" fill="${COLORS.tealDark}"/>${text(340, 519, "2 active", 20, 650, "teal")}
    ${text(41, 566, "Invites", 22, 610, "muted")}
    <rect x="306" y="544" width="118" height="41" rx="21" fill="#3A2A06"/>${text(323, 571, "1 pending", 20, 650, "amber")}
    <rect x="41" y="616" width="304" height="14" rx="7" fill="${COLORS.quiet}"/><rect x="41" y="647" width="226" height="14" rx="7" fill="${COLORS.quiet}"/>
    <rect x="20" y="786" width="425" height="88" rx="20" fill="${COLORS.surface}" stroke="${COLORS.border}" stroke-width="2"/>
    ${logoTile(41, 805, 52)}
    ${text(105, 833, "Install Findafew", 21, 720)}
    ${text(105, 858, "findafew.today", 17, 500, "muted")}
    <rect x="337" y="809" width="88" height="48" rx="24" fill="${COLORS.teal}"/>${text(353, 841, "Install", 20, 720)}
  </svg>`;
}

function buildDesktopPreview() {
  return `<svg viewBox="0 0 815 510" xmlns="http://www.w3.org/2000/svg">
    ${backgroundGradient("desktop-bg", 815, 510)}
    <rect width="815" height="82" fill="#111B19"/><circle cx="37" cy="40" r="10" fill="#67716F"/><circle cx="67" cy="40" r="10" fill="#A8780E"/><circle cx="97" cy="40" r="10" fill="#0F7D73"/>
    <rect x="128" y="20" width="578" height="41" rx="21" fill="${COLORS.quiet}" stroke="${COLORS.border}" stroke-width="1.5"/><circle cx="148" cy="40" r="9" fill="none" stroke="${COLORS.muted}" stroke-width="2"/>
    ${text(170, 46, "findafew.today/download", 17, 510, "muted")}
    <rect x="610" y="24" width="91" height="33" rx="17" fill="${COLORS.tealDark}" stroke="${COLORS.teal}" stroke-width="1.5"/>${text(638, 46, "Install", 17, 650, "teal")}${text(725, 47, "Chrome", 17, 580, "muted")}
    ${line(0, 82, 815, 82)}${line(389, 82, 389, 510)}
    ${logoTile(58, 162, 106)}
    ${text(197, 203, "Findafew", 31, 760)}
    ${text(197, 235, "Small groups for things", 18, 500, "muted")}${text(197, 258, "you want to do.", 18, 500, "muted")}
    ${line(57, 316, 330, 316)}
    ${text(57, 370, "Groups", 20, 520, "muted")}<rect x="230" y="343" width="99" height="39" rx="20" fill="${COLORS.tealDark}"/>${text(247, 369, "2 active", 19, 650, "teal")}
    ${text(57, 417, "Plans", 20, 520, "muted")}${text(213, 417, "Today 7 PM", 20, 650)}
    <rect x="434" y="186" width="337" height="225" rx="32" fill="${COLORS.tealDark}" stroke="${COLORS.teal}" stroke-opacity=".75" stroke-width="2"/>
    ${text(520, 242, "Install Findafew?", 26, 740)}${text(477, 289, "Opens as a focused app without", 19, 500, "muted")}${text(552, 315, "browser tabs.", 19, 500, "muted")}
    <rect x="466" y="335" width="128" height="51" rx="26" fill="none" stroke="${COLORS.border}" stroke-width="2"/>${text(505, 368, "Cancel", 20, 650, "muted")}
    <rect x="610" y="335" width="128" height="51" rx="26" fill="${COLORS.teal}"/>${text(650, 368, "Install", 20, 720)}
  </svg>`;
}

/** @param {string} id @param {number} width @param {number} height */
function backgroundGradient(id, width, height) {
  return `<defs><radialGradient id="${id}" cx="50%" cy="34%" r="78%"><stop offset="0" stop-color="#102421"/><stop offset="1" stop-color="${COLORS.background}"/></radialGradient></defs><rect width="${width}" height="${height}" fill="url(#${id})"/>`;
}

/** @param {{ address: string; width: number }} input */
function browserBar({ address, width }) {
  return `${statusBar(width)}<rect y="48" width="${width}" height="68" fill="#111B19"/>${text(35, 88, "Safari", 25, 650, "muted")}<rect x="119" y="59" width="${width - 212}" height="42" rx="21" fill="${COLORS.quiet}" stroke="${COLORS.border}" stroke-width="1.5"/>${text(147, 87, "Aa", 19, 620, "muted")}${text(185, 87, address, 18, 500, "muted")}<circle cx="${width - 55}" cy="80" r="19" fill="none" stroke="${COLORS.teal}" stroke-width="2"/><path d="M${width - 55} 89v-18m-7 6 7-7 7 7" fill="none" stroke="${COLORS.teal}" stroke-linecap="round" stroke-width="2"/>${line(0, 116, width, 116)}`;
}

/** @param {number} width */
function statusBar(width) {
  return `${text(35, 31, "9:41", 19, 650, "muted")}<path d="M${width - 92} 28q12-12 24 0M${width - 87} 33q7-7 14 0M${width - 81} 38h2" fill="none" stroke="${COLORS.muted}" stroke-linecap="round" stroke-width="2"/><rect x="${width - 48}" y="21" width="22" height="13" rx="3" fill="none" stroke="${COLORS.muted}" stroke-width="2"/><rect x="${width - 24}" y="25" width="3" height="5" rx="1" fill="${COLORS.muted}"/>`;
}

/** @param {number} x @param {number} y @param {number} size */
function logoTile(x, y, size) {
  const padding = Math.round(size * 0.21);
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#11110F"/><image x="${x + padding}" y="${y + padding}" width="${size - padding * 2}" height="${size - padding * 2}" href="data:image/svg+xml;base64,${logoData}"/>`;
}

/** @param {number} x @param {number} y @param {string} value @param {number} size @param {number} weight @param {"amber" | "ink" | "muted" | "teal"} [tone] */
function text(x, y, value, size, weight, tone = "ink") {
  return `<text x="${x}" y="${y}" class="${tone}" font-size="${size}" font-weight="${weight}">${escapeXml(value)}</text>`;
}

/** @param {number} x1 @param {number} y1 @param {number} x2 @param {number} _y2 */
function line(x1, y1, x2, _y2) {
  return `<path d="M${x1} ${y1}H${x2}" stroke="${COLORS.border}" stroke-width="1.5"/>`;
}

/** @param {number} x @param {number} y @param {string} number @param {string} heading @param {string} body @param {"check" | "plus" | "share"} icon @param {boolean} [accent] */
function stepRow(x, y, number, heading, body, icon, accent = false) {
  const cx = x + 31;
  const cy = y + 31;
  const iconMarkup =
    icon === "plus"
      ? plusIcon(cx, cy, 12)
      : icon === "check"
        ? checkIcon(cx, cy)
        : shareIcon(cx, cy);
  return `<circle cx="${cx}" cy="${cy}" r="30" fill="${accent ? COLORS.teal : COLORS.quiet}" stroke="${accent ? COLORS.teal : COLORS.border}" stroke-width="1.5"/>${iconMarkup}${text(x + 82, y + 28, number, 18, 650, "muted")}${text(x + 132, y + 29, heading, 27, 720)}${text(x + 82, y + 59, body, 19, 500, "muted")}`;
}

/** @param {number} x @param {number} y @param {number} radius */
function plusIcon(x, y, radius) {
  return `<path d="M${x - radius} ${y}h${radius * 2}M${x} ${y - radius}v${radius * 2}" stroke="${COLORS.ink}" stroke-linecap="round" stroke-width="3"/>`;
}

/** @param {number} x @param {number} y */
function checkIcon(x, y) {
  return `<path d="M${x - 10} ${y}l7 7 14-16" fill="none" stroke="${COLORS.muted}" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/>`;
}

/** @param {number} x @param {number} y */
function shareIcon(x, y) {
  return `<path d="M${x} ${y + 10}v-22m-7 7 7-7 7 7M${x - 12} ${y + 2}v12h24V${y + 2}" fill="none" stroke="${COLORS.muted}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"/>`;
}

/** @param {string} value */
function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** @param {Buffer} value */
function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
