// @ts-check

import { createHash } from "node:crypto";
import { readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

const DEPLOYMENT_CONTROL_FILES = new Set(["_headers"]);
const CRITICAL_PUBLIC_PATHS = new Set([
  "/index.html",
  "/manifest.webmanifest",
  "/sw.js",
]);

/**
 * Builds the approved byte inventory from the exact deploy directory.
 * Deployment-control files are bound by the outer deploy-tree digest but are
 * not expected to be retrievable as public web assets.
 *
 * @param {object} options Inventory options.
 * @param {string} options.deployDirectory Deploy directory relative to root.
 * @param {string} options.frontendRoot Frontend root.
 */
export async function buildApprovedDeploymentInventory({
  deployDirectory,
  frontendRoot,
}) {
  const root = await realpath(frontendRoot);
  const deployRoot = await realpath(path.resolve(root, deployDirectory));
  const deployStat = await stat(deployRoot);
  if (
    !deployStat.isDirectory() ||
    (deployRoot !== root && !deployRoot.startsWith(`${root}${path.sep}`))
  ) {
    throw new Error("Deploy inventory must resolve inside the frontend root.");
  }

  const relativeFiles = await listFiles(deployRoot);
  const excluded = relativeFiles.filter((relativePath) =>
    DEPLOYMENT_CONTROL_FILES.has(relativePath),
  );
  const entries = [];
  for (const relativePath of relativeFiles) {
    if (DEPLOYMENT_CONTROL_FILES.has(relativePath)) continue;
    // eslint-disable-next-line no-await-in-loop -- exact bytes are hashed deterministically.
    const bytes = await readFile(path.join(deployRoot, relativePath));
    entries.push({
      path: toPublicPath(relativePath),
      sha256: sha256(bytes),
      size: bytes.byteLength,
    });
  }

  const entryMap = new Map(entries.map((entry) => [entry.path, entry]));
  for (const requiredPath of CRITICAL_PUBLIC_PATHS) {
    if (!entryMap.has(requiredPath)) {
      throw new Error("Deploy inventory is missing a critical PWA file.");
    }
  }

  const localReferences = await readReferenceSet({ deployRoot });
  return {
    digest: digestEntries(entries),
    entries,
    excludedControlFileCount: excluded.length,
    localReferences,
  };
}

/**
 * Fetches every approved public byte and rejects missing, extra referenced or
 * mismatched deployed assets. It also independently compares the references
 * published by index.html, the service worker and the web manifest.
 *
 * @param {object} options Verification options.
 * @param {string} options.deployDirectory Deploy directory relative to root.
 * @param {(input: string | URL, init?: RequestInit) => Promise<Response>} [options.fetchImpl] Fetch implementation.
 * @param {string} options.frontendRoot Frontend root.
 * @param {string} options.webOrigin Exact web origin.
 */
export async function verifyDeployedAssetSet({
  deployDirectory,
  fetchImpl = fetch,
  frontendRoot,
  webOrigin,
}) {
  const approved = await buildApprovedDeploymentInventory({
    deployDirectory,
    frontendRoot,
  });
  const actualEntries = [];
  let missing = 0;
  let mismatched = 0;
  const criticalFiles = {
    index: false,
    manifest: false,
    serviceWorker: false,
  };

  await mapConcurrent(approved.entries, 12, async (entry) => {
    let response;
    try {
      response = await fetchImpl(new URL(entry.path, webOrigin), {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      missing += 1;
      return;
    }
    if (!response.ok) {
      missing += 1;
      return;
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const actual = {
      path: entry.path,
      sha256: sha256(bytes),
      size: bytes.byteLength,
    };
    actualEntries.push(actual);
    if (actual.sha256 !== entry.sha256 || actual.size !== entry.size) {
      mismatched += 1;
    }
    if (entry.path === "/index.html") {
      criticalFiles.index = actual.sha256 === entry.sha256;
    } else if (entry.path === "/manifest.webmanifest") {
      criticalFiles.manifest = actual.sha256 === entry.sha256;
    } else if (entry.path === "/sw.js") {
      criticalFiles.serviceWorker = actual.sha256 === entry.sha256;
    }
  });

  const deployedReferences = await fetchReferenceSet({ fetchImpl, webOrigin });
  const extraReferences = [...deployedReferences].filter(
    (reference) => !approved.localReferences.has(reference),
  );
  const missingReferences = [...approved.localReferences].filter(
    (reference) => !deployedReferences.has(reference),
  );
  const matches =
    missing === 0 &&
    mismatched === 0 &&
    extraReferences.length === 0 &&
    missingReferences.length === 0 &&
    Object.values(criticalFiles).every(Boolean) &&
    actualEntries.length === approved.entries.length;

  return {
    approvedDigest: approved.digest,
    approvedFileCount: approved.entries.length,
    criticalFiles,
    deployedDigest: digestEntries(actualEntries),
    excludedControlFileCount: approved.excludedControlFileCount,
    extraReferencedAssetCount: extraReferences.length,
    matches,
    mismatchedAssetCount: mismatched,
    missingAssetCount: missing,
    missingReferencedAssetCount: missingReferences.length,
    verifiedFileCount: actualEntries.length,
  };
}

async function readReferenceSet({ deployRoot }) {
  const [html, manifest, serviceWorker] = await Promise.all([
    readFile(path.join(deployRoot, "index.html"), "utf8"),
    readFile(path.join(deployRoot, "manifest.webmanifest"), "utf8"),
    readFile(path.join(deployRoot, "sw.js"), "utf8"),
  ]);
  return extractPublishedReferences({ html, manifest, serviceWorker });
}

async function fetchReferenceSet({ fetchImpl, webOrigin }) {
  const responses = await Promise.all(
    ["/index.html", "/manifest.webmanifest", "/sw.js"].map((publicPath) =>
      fetchImpl(new URL(publicPath, webOrigin), {
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      }),
    ),
  );
  if (responses.some((response) => !response.ok)) return new Set();
  const [html, manifest, serviceWorker] = await Promise.all(
    responses.map((response) => response.text()),
  );
  return extractPublishedReferences({ html, manifest, serviceWorker });
}

/**
 * @param {object} sources Published metadata sources.
 * @param {string} sources.html Deployed index HTML.
 * @param {string} sources.manifest Web manifest JSON.
 * @param {string} sources.serviceWorker Generated service worker source.
 */
export function extractPublishedReferences({ html, manifest, serviceWorker }) {
  const references = new Set([
    "/index.html",
    "/manifest.webmanifest",
    "/sw.js",
  ]);
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/giu)) {
    addReference(references, match[1]);
  }
  for (const match of serviceWorker.matchAll(/url:["']([^"']+)["']/giu)) {
    addReference(references, match[1]);
  }
  for (const match of serviceWorker.matchAll(
    /(?:importScripts|define)\(?(?:\[)?["']([^"']+)["']/giu,
  )) {
    addReference(references, match[1]);
  }
  try {
    collectManifestSources(JSON.parse(manifest), references);
  } catch {
    references.add("/__invalid-web-manifest");
  }
  return references;
}

function collectManifestSources(value, references) {
  if (Array.isArray(value)) {
    for (const item of value) collectManifestSources(item, references);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (key === "src" && typeof item === "string") {
      addReference(references, item);
    } else {
      collectManifestSources(item, references);
    }
  }
}

function addReference(references, candidate) {
  try {
    const url = new URL(candidate, "https://deploy.invalid/");
    if (url.origin !== "https://deploy.invalid") return;
    references.add(url.pathname);
  } catch {
    references.add("/__invalid-published-reference");
  }
}

async function listFiles(root) {
  const files = [];
  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name, "en"));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        // eslint-disable-next-line no-await-in-loop -- deterministic tree traversal.
        await visit(absolute);
      } else if (entry.isFile()) {
        files.push(path.relative(root, absolute).split(path.sep).join("/"));
      }
    }
  }
  await visit(root);
  return files.sort((left, right) => left.localeCompare(right, "en"));
}

function toPublicPath(relativePath) {
  return `/${relativePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function digestEntries(entries) {
  const normalized = [...entries].sort((left, right) =>
    left.path.localeCompare(right.path, "en"),
  );
  const hash = createHash("sha256");
  for (const entry of normalized) {
    hash.update(entry.path).update("\0");
    hash.update(String(entry.size)).update("\0");
    hash.update(entry.sha256).update("\n");
  }
  return hash.digest("hex");
}

async function mapConcurrent(items, concurrency, mapper) {
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      // eslint-disable-next-line no-await-in-loop -- bounded workers enforce deterministic concurrency.
      await mapper(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
}
