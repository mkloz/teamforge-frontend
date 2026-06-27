/* eslint-disable no-console */
// @ts-check

/**
 * Generates TeamForge PWA icon assets from the canonical SVG favicon.
 *
 * The script writes transparent standard icons plus solid-background maskable
 * and Apple touch icons expected by the manifest and install surfaces.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");
const FAVICON_PATH = path.join(ROOT_DIR, "public", "favicon.svg");
const ICONS_DIR = path.join(ROOT_DIR, "public", "icons");

/**
 * @typedef {object} TransparentIconSpec
 * @property {string} fileName Output file name.
 * @property {number} size Output width and height.
 *
 * @typedef {object} SolidIconSpec
 * @property {string} background Solid background color.
 * @property {string} fileName Output file name.
 * @property {number} iconSize Inner favicon size.
 * @property {number} size Output width and height.
 */

/** @type {readonly TransparentIconSpec[]} */
const TRANSPARENT_ICON_SPECS = [
  { fileName: "pwa-192x192.png", size: 192 },
  { fileName: "pwa-512x512.png", size: 512 },
];

/** @type {readonly SolidIconSpec[]} */
const SOLID_ICON_SPECS = [
  {
    background: "#000000",
    fileName: "pwa-maskable-512x512.png",
    iconSize: 384,
    size: 512,
  },
  {
    background: "#000000",
    fileName: "apple-touch-icon.png",
    iconSize: 144,
    size: 180,
  },
];

/**
 * Resolves a generated icon path.
 *
 * @param {string} fileName Icon file name.
 * @returns {string} Absolute icon path.
 */
function getIconPath(fileName) {
  return path.join(ICONS_DIR, fileName);
}

/**
 * Builds a relative icon log path.
 *
 * @param {string} fileName Icon file name.
 * @returns {string} Relative icon path.
 */
function getIconLogPath(fileName) {
  return `icons/${fileName}`;
}

/**
 * Generates one transparent PWA icon.
 *
 * @param {TransparentIconSpec} spec Icon spec.
 * @returns {Promise<void>}
 */
async function generateTransparentIcon({ fileName, size }) {
  await sharp(FAVICON_PATH)
    .resize(size, size)
    .png()
    .toFile(getIconPath(fileName));
  console.log(`Generated: ${getIconLogPath(fileName)} (transparent)`);
}

/**
 * Generates one solid-background PWA icon.
 *
 * @param {SolidIconSpec} spec Icon spec.
 * @returns {Promise<void>}
 */
async function generateSolidIcon({ background, fileName, iconSize, size }) {
  const resizedSvg = await sharp(FAVICON_PATH)
    .resize(iconSize, iconSize)
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: resizedSvg, gravity: "centre" }])
    .png()
    .toFile(getIconPath(fileName));
  console.log(
    `Generated: ${getIconLogPath(fileName)} (solid background ${background})`,
  );
}

/**
 * Runs async icon tasks in order.
 *
 * @template T
 * @param {readonly T[]} items Items to process.
 * @param {(item: T) => Promise<void>} task Async task.
 * @returns {Promise<void>}
 */
function runSequentially(items, task) {
  return items.reduce(
    (previous, item) => previous.then(() => task(item)),
    Promise.resolve(),
  );
}

/**
 * Builds all PWA icon renditions under `public/icons`.
 *
 * @returns {Promise<void>}
 */
async function generateIcons() {
  try {
    console.log("Generating PWA icons from favicon.svg...");

    // Make sure the icons directory exists
    await fs.mkdir(ICONS_DIR, { recursive: true });

    await runSequentially(TRANSPARENT_ICON_SPECS, generateTransparentIcon);
    await runSequentially(SOLID_ICON_SPECS, generateSolidIcon);

    console.log("All PWA icons successfully updated!");
  } catch (error) {
    console.error("Failed to generate PWA icons:", error);
    process.exit(1);
  }
}

generateIcons().catch(() => {});
