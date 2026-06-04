/* eslint-disable no-console */
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
const ROOT_DIR = path.resolve(__dirname, "..");
const FAVICON_PATH = path.join(ROOT_DIR, "public", "favicon.svg");
const ICONS_DIR = path.join(ROOT_DIR, "public", "icons");

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

    // 1. Generate pwa-192x192.png (Transparent background)
    await sharp(FAVICON_PATH)
      .resize(192, 192)
      .png()
      .toFile(path.join(ICONS_DIR, "pwa-192x192.png"));
    console.log("Generated: icons/pwa-192x192.png (transparent)");

    // 2. Generate pwa-512x512.png (Transparent background)
    await sharp(FAVICON_PATH)
      .resize(512, 512)
      .png()
      .toFile(path.join(ICONS_DIR, "pwa-512x512.png"));
    console.log("Generated: icons/pwa-512x512.png (transparent)");

    // 3. Generate pwa-maskable-512x512.png (Solid background for Android maskable compliance)
    // Sizing the SVG to 384x384 (75% of 512x512) keeps it safely inside the 80% circle safe zone
    const svg512 = await sharp(FAVICON_PATH).resize(384, 384).toBuffer();

    await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: "#000000",
      },
    })
      .composite([{ input: svg512, gravity: "centre" }])
      .png()
      .toFile(path.join(ICONS_DIR, "pwa-maskable-512x512.png"));
    console.log(
      "Generated: icons/pwa-maskable-512x512.png (solid background #000000)",
    );

    // 4. Generate apple-touch-icon.png (Solid background for iOS compatibility)
    // Sizing the SVG to 144x144 (80% of 180x180) leaves a clean border margin
    const svg180 = await sharp(FAVICON_PATH).resize(144, 144).toBuffer();

    await sharp({
      create: {
        width: 180,
        height: 180,
        channels: 4,
        background: "#000000",
      },
    })
      .composite([{ input: svg180, gravity: "centre" }])
      .png()
      .toFile(path.join(ICONS_DIR, "apple-touch-icon.png"));
    console.log(
      "Generated: icons/apple-touch-icon.png (solid background #000000)",
    );

    console.log("All PWA icons successfully updated!");
  } catch (error) {
    console.error("Failed to generate PWA icons:", error);
    process.exit(1);
  }
}

generateIcons().catch(() => {});
