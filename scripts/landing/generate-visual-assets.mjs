/* eslint-disable no-await-in-loop, no-console */

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import Tesseract from "tesseract.js";

const root = process.cwd();
const sourceRoot = path.join(root, "scripts", "landing", "source-edits");
const outputRoot = path.join(root, "public", "landing");
const checkOnly = process.argv.includes("--check");
const audit = [];
const forbiddenOcrPhrases = [
  "strong fit",
  "practical fit",
  "social pace",
  "follow-through",
  "easy pace",
  "open to all",
  "low pressure",
  "shared interests",
  "your group room",
  "open group room",
];

const outputs = await buildMasters();
const ocrWorker = await createOcrWorker();
let ocrPositiveControls;
try {
  ocrPositiveControls = await runOcrPositiveControls(ocrWorker);
  for (const output of outputs) {
    output.audit.ocr = await inspectOcr(ocrWorker, output.buffer);
    await verifyOrWrite(output.path, output.buffer);
    audit.push(output.audit);
  }
} finally {
  await ocrWorker.terminate();
}

for (const output of outputs) {
  for (const width of output.widths) {
    for (const format of ["avif", "webp"]) {
      const buffer = await sharp(output.buffer)
        .resize({ fit: "inside", withoutEnlargement: true, width })
        .toFormat(format, { quality: format === "avif" ? 72 : 82 })
        .toBuffer();
      const derivativePath = path.join(
        outputRoot,
        `${output.id}-${width}.${format}`,
      );
      await verifyOrWrite(derivativePath, buffer);
    }
  }
}

const auditPath = path.join(
  root,
  "..",
  "reports",
  "findafew-implementation",
  "phase-3",
  "landing-asset-audit.json",
);
if (!checkOnly) {
  await mkdir(path.dirname(auditPath), { recursive: true });
}
const auditBuffer = Buffer.from(
  `${JSON.stringify(
    {
      schemaVersion: "1.0.0",
      ocrPositiveControls,
      assets: audit,
    },
    null,
    2,
  )}\n`,
);
await verifyOrWrite(auditPath, auditBuffer);

console.log(
  `${checkOnly ? "Verified" : "Generated"} ${outputs.length} masters, 24 responsive derivatives, and the landing asset audit.`,
);

async function buildMasters() {
  const people = await normalizeTransparentEdit({
    edit: "people-problem-edit.png",
    id: "people-problem-visual",
    master: "people-problem-original.png",
    output: "people-problem-visual-ai-cutout.png",
    requiredText: [
      "Time and place",
      "Saturday afternoon",
      "Group to review",
      "Review group",
    ],
    widths: [720, 1440],
  });
  const plan = await buildLocalizedPlan();
  const group = await buildDeterministicGroup();
  const trust = await normalizeTransparentEdit({
    edit: "trust-control-edit.png",
    id: "trust-control-visual",
    master: "trust-control-original.png",
    output: "trust-control-visual-ai-cutout.png",
    requiredText: [
      "Before you decide",
      "Shared activity",
      "Time and place",
      "Profile details",
      "Review group",
      "Group proposal",
      "Plan details",
      "Accept group",
      "Decline",
      "View plan",
    ],
    widths: [720, 1440],
  });
  const why = await normalizeOpaqueEdit({
    edit: "why-different-edit.png",
    id: "why-different-visual",
    master: "why-different-original.png",
    output: "why-different-visual-ai-text.png",
    requiredText: [
      "Start with a plan",
      "Explore plans",
      "Group proposal",
      "Plan details",
      "Shared activity",
      "Time and place",
      "Review group",
    ],
    widths: [720, 1440],
  });
  return [people, plan, group, trust, why];
}

async function normalizeTransparentEdit({
  edit,
  id,
  master,
  output,
  requiredText,
  widths,
}) {
  const masterPath = path.join(sourceRoot, master);
  const editPath = path.join(sourceRoot, edit);
  const masterRaw = await sharp(masterPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const editRaw = await sharp(editPath)
    .resize(masterRaw.info.width, masterRaw.info.height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const result = Buffer.alloc(masterRaw.data.length);

  for (
    let pixel = 0;
    pixel < masterRaw.info.width * masterRaw.info.height;
    pixel += 1
  ) {
    const masterOffset = pixel * 4;
    const editOffset = pixel * 3;
    const alpha = masterRaw.data[masterOffset + 3];
    const bakedTransparencyGrid = isBakedTransparencyGridPixel({
      data: editRaw.data,
      height: masterRaw.info.height,
      pixel,
      width: masterRaw.info.width,
    });
    const preserveOriginal = alpha < 255 || bakedTransparencyGrid;
    for (let channel = 0; channel < 3; channel += 1) {
      result[masterOffset + channel] = preserveOriginal
        ? masterRaw.data[masterOffset + channel]
        : editRaw.data[editOffset + channel];
    }
    result[masterOffset + 3] = alpha;
  }

  const buffer = await sharp(result, {
    raw: {
      channels: 4,
      height: masterRaw.info.height,
      width: masterRaw.info.width,
    },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return makeOutput({
    buffer,
    id,
    masterPath,
    output,
    requiredText,
    sourcePaths: [editPath],
    widths,
  });
}

async function normalizeOpaqueEdit({
  edit,
  id,
  master,
  output,
  requiredText,
  widths,
}) {
  const masterPath = path.join(sourceRoot, master);
  const masterMetadata = await sharp(masterPath).metadata();
  const editPath = path.join(sourceRoot, edit);
  const buffer = await sharp(editPath)
    .resize(masterMetadata.width, masterMetadata.height, { fit: "fill" })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toBuffer();
  return makeOutput({
    buffer,
    id,
    masterPath,
    output,
    requiredText,
    sourcePaths: [editPath],
    widths,
  });
}

async function buildLocalizedPlan() {
  const id = "plan-to-group-visual";
  const masterPath = path.join(sourceRoot, "plan-to-group-original.png");
  const editPath = path.join(sourceRoot, "plan-to-group-edit.png");
  const regions = [
    [210, 225, 230, 95],
    [805, 185, 215, 70],
    [1290, 175, 285, 75],
    [1270, 345, 285, 125],
    [1240, 555, 325, 90],
  ];
  const { buffer, editedMaskFraction, outsideMaskChanges } =
    await localizedComposite(masterPath, editPath, regions);
  return makeOutput({
    buffer,
    editedMaskFraction,
    id,
    masterPath,
    output: "plan-to-group-visual-ai-cutout.png",
    outsideMaskChanges,
    regions,
    requiredText: [
      "Shared activity",
      "Plan details",
      "Group proposal",
      "Time and place",
      "Group to review",
      "Review group",
    ],
    sourcePaths: [editPath],
    widths: [720, 1440, 1775],
  });
}

async function buildDeterministicGroup() {
  const id = "group-feels-right-visual";
  const masterPath = path.join(sourceRoot, "group-feels-right-original.png");
  const masterMetadata = await sharp(masterPath).metadata();
  const regions = [
    [140, 72, 270, 80],
    [140, 360, 270, 82],
    [45, 460, 370, 105],
    [825, 72, 345, 82],
    [750, 488, 565, 80],
    [820, 575, 535, 80],
    [1680, 62, 390, 100],
    [1680, 350, 390, 105],
  ];
  const masterRaw = await sharp(masterPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const erased = eraseRegions(masterRaw, regions);
  const svg = await groupTextLayer(
    masterMetadata.width ?? 2194,
    masterMetadata.height ?? 717,
  );
  const composited = await sharp(erased, {
    raw: {
      channels: 4,
      height: masterRaw.info.height,
      width: masterRaw.info.width,
    },
  })
    .composite([{ input: svg, left: 0, top: 0 }])
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const mask = makeRectangleMask(
    masterRaw.info.width,
    masterRaw.info.height,
    regions,
  );
  const outsideMaskChanges = 0;
  let editedMaskPixels = 0;
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    const offset = pixel * 4;
    composited.data[offset + 3] = masterRaw.data[offset + 3];
    if (mask[pixel] === 1) {
      editedMaskPixels += 1;
      continue;
    }
    for (let channel = 0; channel < 4; channel += 1) {
      composited.data[offset + channel] = masterRaw.data[offset + channel];
    }
  }
  const buffer = await sharp(composited.data, {
    raw: {
      channels: 4,
      height: masterRaw.info.height,
      width: masterRaw.info.width,
    },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return makeOutput({
    buffer,
    editedMaskFraction:
      editedMaskPixels / (masterRaw.info.width * masterRaw.info.height),
    id,
    masterPath,
    output: "group-feels-right-visual-ai-cutout.png",
    outsideMaskChanges,
    regions,
    requiredText: [
      "Shared activity",
      "Group size",
      "3–6 people",
      "Group proposal",
      "Time and place",
      "Before you decide",
      "Review group",
      "Plan details",
      "Plan updates",
    ],
    sourcePaths: [],
    widths: [720, 1440, 2194],
  });
}

async function localizedComposite(masterPath, editPath, regions) {
  const master = await sharp(masterPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const edit = await sharp(editPath)
    .resize(master.info.width, master.info.height, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const output = Buffer.from(master.data);
  const mask = new Uint8Array(master.info.width * master.info.height);
  let editedMaskPixels = 0;
  for (const [left, top, width, height] of regions) {
    const feather = 10;
    for (let y = top; y < top + height; y += 1) {
      for (let x = left; x < left + width; x += 1) {
        const pixel = y * master.info.width + x;
        const offset = pixel * 4;
        const distance = Math.min(
          x - left,
          left + width - 1 - x,
          y - top,
          top + height - 1 - y,
        );
        const weight = Math.min(1, Math.max(0, distance / feather));
        mask[pixel] = Math.max(mask[pixel], Math.round(weight * 255));
        for (let channel = 0; channel < 3; channel += 1) {
          output[offset + channel] = Math.round(
            master.data[offset + channel] * (1 - weight) +
              edit.data[offset + channel] * weight,
          );
        }
        output[offset + 3] = master.data[offset + 3];
      }
    }
  }
  for (const value of mask) {
    if (value > 0) editedMaskPixels += 1;
  }
  const buffer = await sharp(output, {
    raw: {
      channels: 4,
      height: master.info.height,
      width: master.info.width,
    },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();
  return {
    buffer,
    editedMaskFraction:
      editedMaskPixels / (master.info.width * master.info.height),
    outsideMaskChanges: 0,
  };
}

async function groupTextLayer(width, height) {
  const font = await readFile(
    path.join(
      root,
      "node_modules",
      "@fontsource-variable",
      "source-sans-3",
      "files",
      "source-sans-3-latin-wght-normal.woff2",
    ),
  );
  const fontUrl = `data:font/woff2;base64,${font.toString("base64")}`;
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face { font-family: 'Findafew Sans'; src: url('${fontUrl}') format('woff2'); font-weight: 200 900; }
          .label { font-family: 'Findafew Sans', 'Segoe UI', sans-serif; fill: #f5f7f7; font-size: 30px; font-weight: 650; }
          .small { font-family: 'Findafew Sans', 'Segoe UI', sans-serif; fill: #f5f7f7; font-size: 21px; font-weight: 450; }
          .teal { fill: #00b7b3; }
          .line { fill: none; stroke: #00b7b3; stroke-linecap: round; stroke-linejoin: round; stroke-width: 3; }
        </style>
        <linearGradient id="button" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#078b85"/>
          <stop offset="1" stop-color="#09a9a7"/>
        </linearGradient>
      </defs>

      <g>
        <text class="label" x="155" y="119">Shared activity</text>
      </g>
      <g>
        <text class="label" x="155" y="412">Group size</text>
        <rect x="58" y="472" width="338" height="82" rx="18" fill="#151c20" stroke="#3b4448" stroke-width="1.5"/>
        <path class="line" d="M93 525c0-13 10-23 23-23s23 10 23 23M105 491a11 11 0 1 0 22 0 11 11 0 1 0-22 0M138 516c4-8 11-13 20-13 12 0 22 10 22 22"/>
        <text class="small" x="205" y="526">3–6 people</text>
      </g>
      <g>
        <text x="850" y="121" class="label teal">Group proposal</text>
      </g>
      <g>
        <rect x="770" y="500" width="145" height="48" rx="24" fill="#073d3b" stroke="#006b68"/>
        <text class="small teal" x="790" y="531">Shared activity</text>
        <rect x="927" y="500" width="146" height="48" rx="24" fill="#202527" stroke="#3d4447"/>
        <text class="small" x="948" y="531">Time and place</text>
        <rect x="1085" y="500" width="190" height="48" rx="24" fill="#202527" stroke="#3d4447"/>
        <text class="small" x="1103" y="531">Before you decide</text>
        <rect x="827" y="581" width="518" height="64" rx="16" fill="url(#button)"/>
        <text class="label" x="978" y="624">Review group</text>
        <path d="M1273 613h20m-8-9 9 9-9 9" fill="none" stroke="#f5f7f7" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/>
      </g>
      <g>
        <text class="label" x="1725" y="119">Plan details</text>
      </g>
      <g>
        <text class="label" x="1725" y="411">Plan updates</text>
      </g>
    </svg>
  `);
}

function eraseRegions(masterRaw, regions) {
  const output = Buffer.from(masterRaw.data);
  for (const [left, top, width, height] of regions) {
    const feather = 10;
    const fill = [10, 13, 15];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const targetPixel = (top + y) * masterRaw.info.width + left + x;
        const targetOffset = targetPixel * 4;
        const distance = Math.min(x, width - 1 - x, y, height - 1 - y);
        const weight = Math.min(1, Math.max(0, distance / feather));
        for (let channel = 0; channel < 3; channel += 1) {
          output[targetOffset + channel] = Math.round(
            masterRaw.data[targetOffset + channel] * (1 - weight) +
              fill[channel] * weight,
          );
        }
        output[targetOffset + 3] = masterRaw.data[targetOffset + 3];
      }
    }
  }
  return output;
}

function isBakedTransparencyGridPixel({ data, height, pixel, width }) {
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  if (x < 4 || y < 4 || x >= width - 4 || y >= height - 4) return false;
  const offset = pixel * 3;
  const channels = [data[offset], data[offset + 1], data[offset + 2]];
  if (
    Math.min(...channels) < 140 ||
    Math.max(...channels) - Math.min(...channels) > 6
  ) {
    return false;
  }
  for (const neighbour of [
    pixel - 4,
    pixel + 4,
    pixel - width * 4,
    pixel + width * 4,
  ]) {
    const neighbourOffset = neighbour * 3;
    for (let channel = 0; channel < 3; channel += 1) {
      if (Math.abs(data[neighbourOffset + channel] - channels[channel]) > 6) {
        return false;
      }
    }
  }
  return true;
}

async function makeOutput({
  buffer,
  editedMaskFraction,
  id,
  masterPath,
  output,
  outsideMaskChanges,
  regions = [],
  requiredText,
  sourcePaths,
  widths,
}) {
  const outputMetadata = await sharp(buffer).metadata();
  const masterMetadata = await sharp(masterPath).metadata();
  const alphaMatchesMaster = await compareAlpha(masterPath, buffer);
  const pixelDifferenceFraction = await comparePixels(masterPath, buffer);
  return {
    audit: {
      alphaMatchesMaster,
      dimensionsMatchMaster:
        outputMetadata.width === masterMetadata.width &&
        outputMetadata.height === masterMetadata.height,
      editedMaskFraction: editedMaskFraction ?? null,
      id,
      manualReviewChecklist: {
        checks: [
          "Compare the original-resolution master with its governed source.",
          "Inspect composition, alpha, palette, card geometry and text placement.",
          "Inspect the responsive 720px derivative for readable, undistorted text.",
        ],
        provenance:
          "Generator-authored checklist only; independent human attestation is recorded separately.",
        scope:
          "Original-resolution composition, alpha, text, palette, card geometry, and responsive 720px derivative",
        status: "requires-independent-attestation",
      },
      masterSha256Before: sha256(await readFile(masterPath)),
      output: {
        channels: outputMetadata.channels,
        hasAlpha: outputMetadata.hasAlpha,
        height: outputMetadata.height,
        sha256: sha256(buffer),
        width: outputMetadata.width,
      },
      outsideMaskChanges: outsideMaskChanges ?? null,
      pixelDifferenceFraction,
      regions,
      requiredText,
      sourceSha256: await Promise.all(
        sourcePaths.map(async (sourcePath) => ({
          name: path.basename(sourcePath),
          sha256: sha256(await readFile(sourcePath)),
        })),
      ),
    },
    buffer,
    id,
    path: path.join(outputRoot, output),
    widths,
  };
}

async function comparePixels(masterPath, outputBuffer) {
  const [master, output] = await Promise.all([
    sharp(masterPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(outputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ]);
  if (
    master.info.width !== output.info.width ||
    master.info.height !== output.info.height
  ) {
    return 1;
  }
  let differentPixels = 0;
  for (
    let pixel = 0;
    pixel < master.info.width * master.info.height;
    pixel += 1
  ) {
    const offset = pixel * 4;
    for (let channel = 0; channel < 4; channel += 1) {
      if (master.data[offset + channel] !== output.data[offset + channel]) {
        differentPixels += 1;
        break;
      }
    }
  }
  return differentPixels / (master.info.width * master.info.height);
}

async function createOcrWorker() {
  const { createWorker, OEM } = Tesseract;
  return createWorker("eng", OEM.LSTM_ONLY, {
    cacheMethod: "none",
    langPath: path.join(
      root,
      "node_modules",
      "@tesseract.js-data",
      "eng",
      "4.0.0_best_int",
    ),
  });
}

async function inspectOcr(worker, buffer) {
  const result = await recognizeOcr(worker, buffer);
  return assertNoForbiddenOcr(result);
}

async function recognizeOcr(worker, buffer) {
  const prepared = await sharp(buffer)
    .flatten({ background: "#000000" })
    .grayscale()
    .normalize()
    .withMetadata({ density: 300 })
    .png()
    .toBuffer();
  const { data } = await worker.recognize(prepared);
  const observedText = data.text.replace(/\s+/gu, " ").trim();
  const normalizedText = observedText.toLocaleLowerCase("en-GB");
  const detectedForbiddenPhrases = forbiddenOcrPhrases.filter((phrase) =>
    normalizedText.includes(phrase),
  );
  return {
    detectedForbiddenPhrases,
    engine: "tesseract.js@6.0.1",
    language: "eng/4.0.0_best_int (bundled, offline)",
    observedText,
  };
}

function assertNoForbiddenOcr(result) {
  if (!result.observedText) {
    throw new Error("Landing visual OCR returned no text.");
  }
  if (result.detectedForbiddenPhrases.length > 0) {
    throw new Error(
      `Landing visual OCR found forbidden legacy copy: ${result.detectedForbiddenPhrases.join(", ")}`,
    );
  }
  return {
    ...result,
    status: "passed",
  };
}

async function runOcrPositiveControls(worker) {
  const controls = [];
  for (const phrase of ["Strong fit", "Social pace"]) {
    const buffer = await renderOcrPositiveControl(phrase);
    const result = await recognizeOcr(worker, buffer);
    let rejected = false;
    try {
      assertNoForbiddenOcr(result);
    } catch (error) {
      rejected =
        error instanceof Error &&
        error.message.includes("forbidden legacy copy") &&
        result.detectedForbiddenPhrases.includes(
          phrase.toLocaleLowerCase("en-GB"),
        );
    }
    if (!rejected) {
      throw new Error(`OCR positive control was not rejected: ${phrase}`);
    }
    controls.push({
      detectedForbiddenPhrases: result.detectedForbiddenPhrases,
      observedText: result.observedText,
      phrase,
      pixelSha256: sha256(buffer),
      status: "rejected-as-required",
    });
  }
  return controls;
}

async function renderOcrPositiveControl(phrase) {
  const font = await readFile(
    path.join(
      root,
      "node_modules",
      "@fontsource-variable",
      "source-sans-3",
      "files",
      "source-sans-3-latin-wght-normal.woff2",
    ),
  );
  const fontUrl = `data:font/woff2;base64,${font.toString("base64")}`;
  const svg = `<svg width="1600" height="420" xmlns="http://www.w3.org/2000/svg"><style>@font-face{font-family:'Control';src:url('${fontUrl}') format('woff2')}text{font-family:'Control',sans-serif;font-size:180px;font-weight:700;fill:#fff}</style><rect width="1600" height="420" fill="#000"/><text x="80" y="275">${phrase}</text></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function compareAlpha(masterPath, outputBuffer) {
  const masterMetadata = await sharp(masterPath).metadata();
  const outputMetadata = await sharp(outputBuffer).metadata();
  if (!masterMetadata.hasAlpha && !outputMetadata.hasAlpha) return true;
  if (masterMetadata.hasAlpha !== outputMetadata.hasAlpha) return false;
  const [masterAlpha, outputAlpha] = await Promise.all([
    sharp(masterPath).extractChannel("alpha").raw().toBuffer(),
    sharp(outputBuffer).extractChannel("alpha").raw().toBuffer(),
  ]);
  return masterAlpha.equals(outputAlpha);
}

function makeRectangleMask(width, height, regions) {
  const mask = new Uint8Array(width * height);
  for (const [left, top, regionWidth, regionHeight] of regions) {
    for (let y = top; y < Math.min(height, top + regionHeight); y += 1) {
      for (let x = left; x < Math.min(width, left + regionWidth); x += 1) {
        mask[y * width + x] = 1;
      }
    }
  }
  return mask;
}

async function verifyOrWrite(filePath, expected) {
  if (checkOnly) {
    const current = await readFile(filePath);
    if (!current.equals(expected)) {
      throw new Error(
        `Generated asset drift: ${path.relative(root, filePath)}`,
      );
    }
    return;
  }
  await writeFile(filePath, expected);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
