/// <reference types="vitest/config" />

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig, loadEnv } from "vite";
import type { ManifestOptions } from "vite-plugin-pwa";
import { VitePWA } from "vite-plugin-pwa";
import { changedFileLintPlugin } from "./scripts/lint/vite-changed-file-lint-plugin";
import { normalizeBaseUrl } from "./src/shared/lib/url-normalization";

const teamForgeManifest = {
  id: "/",
  name: "TeamForge",
  short_name: "TeamForge",
  description:
    "TeamForge forms small, compatible groups for shared real-world activities using personality, interests, and social context.",
  lang: "en",
  start_url: "/home?source=pwa",
  scope: "/",
  display: "standalone",
  background_color: "#FAFAF8",
  theme_color: "#0D9488",
  categories: ["social", "lifestyle"],
  icons: [
    {
      src: "/icons/pwa-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/pwa-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/pwa-maskable-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
  prefer_related_applications: false,
  shortcuts: [
    {
      name: "Forge my group",
      short_name: "Forge",
      description: "Start forming a compatible group.",
      url: "/forge?source=pwa-shortcut",
      icons: [
        {
          src: "/icons/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
    {
      name: "Open activity",
      short_name: "Activity",
      description: "Open conversations and group plans.",
      url: "/activity?source=pwa-shortcut",
      icons: [
        {
          src: "/icons/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
    {
      name: "Explore groups",
      short_name: "Explore",
      description: "Browse people and group options.",
      url: "/explore?source=pwa-shortcut",
      icons: [
        {
          src: "/icons/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
  ],
} satisfies Partial<ManifestOptions>;

const APP_URL_PLACEHOLDER = "__TEAMFORGE_APP_URL__";
const PUBLIC_ROUTE_LASTMOD = "2026-06-04";
const PUBLIC_ROUTES = [
  { changefreq: "weekly", path: "/", priority: "1.0" },
  { changefreq: "monthly", path: "/download", priority: "0.7" },
  { changefreq: "yearly", path: "/privacy", priority: "0.4" },
  { changefreq: "yearly", path: "/terms", priority: "0.4" },
] as const;
const INLINE_BOOT_SCRIPT_HASH =
  "'sha256-Kz8UUC2j01g+EoplSxH6vyCDPpV2Ix8kySI75UjgdEM='";

const PUBLIC_LUCIDE_ICON_MODULES = new Set([
  "bell.js",
  "bookmark.js",
  "circle-check.js",
  "clipboard-check.js",
  "clipboard-copy.js",
  "download.js",
  "ellipsis-vertical.js",
  "globe.js",
  "menu.js",
  "monitor-smartphone.js",
  "plus.js",
  "refresh-cw.js",
  "share.js",
  "smartphone.js",
  "wifi.js",
  "wifi-off.js",
  "x.js",
]);

const PUBLIC_LUCIDE_HELPER_MODULE_PATTERNS = [
  "/lucide-react/dist/esm/createLucideIcon.js",
  "/lucide-react/dist/esm/defaultAttributes.js",
  "/lucide-react/dist/esm/Icon.js",
  "/lucide-react/dist/esm/shared/src/utils/",
];

type VendorChunkRule = {
  name: string;
  patterns: readonly string[];
};

const PRE_ICON_VENDOR_CHUNK_RULES = [
  {
    name: "framework",
    patterns: ["/react/", "/react-dom/", "/scheduler/"],
  },
  {
    name: "tanstack",
    patterns: ["/@tanstack/react-router", "/@tanstack/react-query"],
  },
  {
    name: "motion",
    patterns: ["/framer-motion/"],
  },
  {
    name: "charts",
    patterns: ["/recharts/", "/d3-", "/d3/"],
  },
  {
    name: "forms",
    patterns: ["/react-hook-form/", "/@hookform/resolvers/"],
  },
  {
    name: "validation",
    patterns: ["/zod/"],
  },
  {
    name: "radix-slot",
    patterns: ["/@radix-ui/react-slot/", "/@radix-ui/react-compose-refs/"],
  },
  {
    name: "radix-overlay-core",
    patterns: [
      "/@radix-ui/react-label/",
      "/@radix-ui/react-tooltip/",
      "/@radix-ui/react-arrow/",
      "/@radix-ui/react-context/",
      "/@radix-ui/react-dismissable-layer/",
      "/@radix-ui/react-id/",
      "/@radix-ui/react-popper/",
      "/@radix-ui/react-portal/",
      "/@radix-ui/react-presence/",
      "/@radix-ui/react-primitive/",
      "/@radix-ui/react-use-callback-ref/",
      "/@radix-ui/react-use-controllable-state/",
      "/@radix-ui/react-use-escape-keydown/",
      "/@radix-ui/react-use-layout-effect/",
      "/@radix-ui/react-use-rect/",
      "/@radix-ui/react-use-size/",
      "/@radix-ui/react-visually-hidden/",
      "/@radix-ui/primitive/",
      "/@radix-ui/rect/",
    ],
  },
  {
    name: "ui-vendor",
    patterns: [
      "/@radix-ui/",
      "/radix-ui/",
      "/vaul/",
      "/embla-carousel-react/",
      "/input-otp/",
      "/sonner/",
    ],
  },
] satisfies readonly VendorChunkRule[];

const POST_ICON_VENDOR_CHUNK_RULES = [
  {
    name: "http-client",
    patterns: ["/ky/"],
  },
  {
    name: "realtime-vendor",
    patterns: [
      "/socket.io-client/",
      "/socket.io-parser/",
      "/engine.io-client/",
      "/engine.io-parser/",
    ],
  },
  {
    name: "analytics",
    patterns: ["/@vercel/analytics/"],
  },
  {
    name: "state-routing",
    patterns: ["/nuqs/", "/zustand/"],
  },
  {
    name: "text-layout",
    patterns: ["/@chenglou/pretext/"],
  },
  {
    name: "utilities",
    patterns: [
      "/class-variance-authority/",
      "/clsx/",
      "/dayjs/",
      "/tailwind-merge/",
    ],
  },
] satisfies readonly VendorChunkRule[];

function normalizeModuleId(id: string) {
  return id.replace(/\\/g, "/");
}

function findVendorChunkName(id: string, rules: readonly VendorChunkRule[]) {
  return rules.find(({ patterns }) =>
    patterns.some((pattern) => id.includes(pattern)),
  )?.name;
}

function getLucideChunkName(id: string) {
  const normalizedId = normalizeModuleId(id);

  if (!normalizedId.includes("/lucide-react/")) {
    return null;
  }

  if (
    PUBLIC_LUCIDE_HELPER_MODULE_PATTERNS.some((pattern) =>
      normalizedId.includes(pattern),
    )
  ) {
    return "public-icons";
  }

  if (normalizedId.includes("/lucide-react/dist/esm/icons/")) {
    const fileName = normalizedId.split("/").at(-1);

    if (fileName && PUBLIC_LUCIDE_ICON_MODULES.has(fileName)) {
      return "public-icons";
    }
  }

  return "icons";
}

function getNodeModuleChunkName(id: string) {
  const normalizedId = normalizeModuleId(id);

  if (!normalizedId.includes("node_modules")) {
    return undefined;
  }

  const preIconChunkName = findVendorChunkName(
    normalizedId,
    PRE_ICON_VENDOR_CHUNK_RULES,
  );

  if (preIconChunkName) {
    return preIconChunkName;
  }

  return (
    getLucideChunkName(normalizedId) ??
    findVendorChunkName(normalizedId, POST_ICON_VENDOR_CHUNK_RULES)
  );
}

function replaceAppUrlPlaceholder(source: string, appUrl: string) {
  return source.replaceAll(APP_URL_PLACEHOLDER, appUrl);
}

function getUrlOrigin(value: string) {
  return new URL(value).origin;
}

function getWebSocketOrigin(value: string) {
  const url = new URL(value);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";

  return `${protocol}//${url.host}`;
}

function getOptionalUrlOrigin(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getSentryConnectSources(sentryDsn: string | null) {
  const sentryOrigin = getOptionalUrlOrigin(sentryDsn);

  return sentryOrigin ? [sentryOrigin] : [];
}

function renderContentSecurityPolicy({
  apiUrl,
  mediaBaseUrl,
  sentryDsn,
}: {
  apiUrl: string;
  mediaBaseUrl: string;
  sentryDsn: string | null;
}) {
  const mediaOrigin = getUrlOrigin(mediaBaseUrl);
  const apiOrigin = getUrlOrigin(apiUrl);
  const realtimeOrigin = getWebSocketOrigin(apiUrl);
  const sentryConnectSources = getSentryConnectSources(sentryDsn);

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    [
      "script-src 'self'",
      INLINE_BOOT_SCRIPT_HASH,
      "https://accounts.google.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
    ].join(" "),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    [
      "img-src 'self' data: blob:",
      mediaOrigin,
      "https://images.unsplash.com",
      "https://*.giphy.com",
      "https://giphy.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://*.googleusercontent.com",
    ].join(" "),
    "font-src 'self' https://fonts.gstatic.com",
    [
      "connect-src 'self'",
      apiOrigin,
      realtimeOrigin,
      "https://accounts.google.com",
      "https://maps.googleapis.com",
      "https://places.googleapis.com",
      "https://api.giphy.com",
      "https://*.giphy.com",
      ...sentryConnectSources,
    ].join(" "),
    "media-src 'self' blob: https://*.giphy.com https://giphy.com",
    "manifest-src 'self'",
    "worker-src 'self'",
    "frame-src 'self' https://accounts.google.com",
    "form-action 'self'",
  ].join("; ");
}

function renderHeadersFile({
  apiUrl,
  mediaBaseUrl,
  sentryDsn,
}: {
  apiUrl: string;
  mediaBaseUrl: string;
  sentryDsn: string | null;
}) {
  const csp = renderContentSecurityPolicy({ apiUrl, mediaBaseUrl, sentryDsn });

  return `/*
  Content-Security-Policy: ${csp};
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), payment=(), usb=(), geolocation=(self)
  Cross-Origin-Opener-Policy: same-origin-allow-popups
  Cross-Origin-Resource-Policy: same-origin
  Cache-Control: public, max-age=0, must-revalidate

/manifest.webmanifest
  Content-Type: application/manifest+json; charset=utf-8
  Cache-Control: public, max-age=0, must-revalidate

/sw.js
  Cache-Control: public, max-age=0, must-revalidate
  Service-Worker-Allowed: /

/sw-push.js
  Cache-Control: public, max-age=0, must-revalidate

/workbox-*.js
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/icons/*
  Cache-Control: public, max-age=0, must-revalidate

/download/*
  Cache-Control: public, max-age=0, must-revalidate
`;
}

function renderRobotsTxt(appUrl: string) {
  return `User-agent: *
Allow: /

Sitemap: ${appUrl}/sitemap.xml
`;
}

function renderSitemapXml(appUrl: string) {
  const entries = PUBLIC_ROUTES.map(
    (route) => `  <url>
    <loc>${appUrl}${route.path === "/" ? "/" : route.path}</loc>
    <lastmod>${PUBLIC_ROUTE_LASTMOD}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function getRequestAppUrl(request: { headers: { host?: string } }) {
  const host = request.headers.host;

  return host ? `http://${host}` : null;
}

function teamForgePublicHostPlugin({
  apiUrl,
  appUrl,
  mediaBaseUrl,
  sentryDsn,
}: {
  apiUrl: string | null;
  appUrl: string | null;
  mediaBaseUrl: string | null;
  sentryDsn: string | null;
}): Plugin {
  let outDir: string;

  return {
    name: "teamforge-public-host",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    transformIndexHtml(html) {
      return replaceAppUrlPlaceholder(html, appUrl ?? "");
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = request.url?.split("?")[0];

        if (pathname !== "/robots.txt" && pathname !== "/sitemap.xml") {
          next();
          return;
        }

        const requestAppUrl = appUrl ?? getRequestAppUrl(request);

        if (!requestAppUrl) {
          next();
          return;
        }

        response.statusCode = 200;

        if (pathname === "/robots.txt") {
          response.setHeader("Content-Type", "text/plain; charset=utf-8");
          response.end(renderRobotsTxt(requestAppUrl));
          return;
        }

        response.setHeader("Content-Type", "application/xml; charset=utf-8");
        response.end(renderSitemapXml(requestAppUrl));
      });
    },
    async writeBundle() {
      if (!appUrl || !apiUrl || !mediaBaseUrl) {
        throw new Error(
          "VITE_APP_URL, VITE_API_URL, and VITE_MEDIA_BASE_URL are required to generate public deployment files.",
        );
      }

      await mkdir(outDir, { recursive: true });
      await Promise.all([
        writeFile(
          path.join(outDir, "_headers"),
          renderHeadersFile({ apiUrl, mediaBaseUrl, sentryDsn }),
        ),
        writeFile(path.join(outDir, "robots.txt"), renderRobotsTxt(appUrl)),
        writeFile(path.join(outDir, "sitemap.xml"), renderSitemapXml(appUrl)),
      ]);
    },
  };
}

function teamForgeManifestDevPlugin(): Plugin {
  return {
    apply: "serve",
    name: "teamforge-dev-manifest",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== "/manifest.webmanifest") {
          next();
          return;
        }

        response.statusCode = 200;
        response.setHeader(
          "Content-Type",
          "application/manifest+json; charset=utf-8",
        );
        response.end(JSON.stringify(teamForgeManifest));
      });
    },
  };
}

function readTrimmedEnv(name: string) {
  return process.env[name]?.trim() || null;
}

function getOptionalTrimmedValue(value: string | undefined) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

function asOptionalPluginValue(value: string | null) {
  return value === null ? undefined : value;
}

function getSentryReleaseName() {
  return (
    readTrimmedEnv("SENTRY_RELEASE") ??
    readTrimmedEnv("VITE_SENTRY_RELEASE") ??
    readTrimmedEnv("GITHUB_SHA")
  );
}

function getSentrySourcemapUploadConfig() {
  const authToken = readTrimmedEnv("SENTRY_AUTH_TOKEN");
  const org = readTrimmedEnv("SENTRY_ORG");
  const project = readTrimmedEnv("SENTRY_PROJECT");

  if (!authToken || !org || !project) {
    return null;
  }

  return { authToken, org, project };
}

function getSentryBuildPlugins(command: string) {
  if (command !== "build") {
    return [];
  }

  const uploadConfig = getSentrySourcemapUploadConfig();

  if (!uploadConfig) {
    return [];
  }

  return sentryVitePlugin({
    authToken: uploadConfig.authToken,
    org: uploadConfig.org,
    project: uploadConfig.project,
    release: {
      name: asOptionalPluginValue(getSentryReleaseName()),
    },
    sourcemaps: {
      assets: "./dist/assets/**",
      filesToDeleteAfterUpload: "./dist/assets/**/*.map",
    },
    telemetry: false,
    bundleSizeOptimizations: {
      excludeDebugStatements: true,
      excludeReplayIframe: true,
      excludeReplayShadowDom: true,
      excludeReplayWorker: true,
    },
  });
}

function hasRequiredPublicBuildEnv({
  apiUrl,
  appUrl,
  mediaBaseUrl,
}: {
  apiUrl: string | null;
  appUrl: string | null;
  mediaBaseUrl: string | null;
}) {
  return Boolean(appUrl && apiUrl && mediaBaseUrl);
}

function assertRequiredPublicBuildEnv({
  apiUrl,
  appUrl,
  command,
  mediaBaseUrl,
}: {
  apiUrl: string | null;
  appUrl: string | null;
  command: string;
  mediaBaseUrl: string | null;
}) {
  if (command !== "build") {
    return;
  }

  if (hasRequiredPublicBuildEnv({ apiUrl, appUrl, mediaBaseUrl })) {
    return;
  }

  throw new Error(
    "VITE_APP_URL, VITE_API_URL, and VITE_MEDIA_BASE_URL must be set to build TeamForge.",
  );
}

function getReactPluginOptions(command: string) {
  if (command !== "build") {
    return undefined;
  }

  return {
    babel: {
      plugins: ["babel-plugin-react-compiler"],
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appUrl = normalizeBaseUrl(env.VITE_APP_URL);
  const apiUrl = normalizeBaseUrl(env.VITE_API_URL);
  const mediaBaseUrl = normalizeBaseUrl(env.VITE_MEDIA_BASE_URL);
  const sentryDsn = getOptionalTrimmedValue(env.VITE_SENTRY_DSN);
  const shouldUploadSentrySourcemaps =
    getSentrySourcemapUploadConfig() !== null;

  assertRequiredPublicBuildEnv({ apiUrl, appUrl, command, mediaBaseUrl });

  return {
    plugins: [
      react(getReactPluginOptions(command)),
      tailwindcss(),
      teamForgePublicHostPlugin({ apiUrl, appUrl, mediaBaseUrl, sentryDsn }),
      teamForgeManifestDevPlugin(),
      VitePWA({
        registerType: "prompt",
        injectRegister: null,
        includeAssets: [
          "favicon.svg",
          "fonts/inter-latin-var.woff2",
          "icons/apple-touch-icon.png",
          "icons/pwa-192x192.png",
          "icons/pwa-512x512.png",
          "icons/pwa-maskable-512x512.png",
          "download/install-preview-android-256w.png",
          "download/install-preview-android-360w.png",
          "download/install-preview-android.png",
          "download/install-preview-desktop-480w.png",
          "download/install-preview-desktop.png",
          "download/install-preview-ios-480w.png",
          "download/install-preview-ios-720w.png",
          "download/install-preview-ios.png",
        ],
        manifest: teamForgeManifest,
        workbox: {
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 4194304,
          globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
          globIgnores: ["**/avatars/**", "**/group-covers/**"],
          importScripts: ["sw-push.js"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.destination === "image" &&
                (url.pathname.startsWith("/avatars/") ||
                  url.pathname.startsWith("/group-covers/")),
              handler: "CacheFirst",
              options: {
                cacheName: "teamforge-public-images",
                expiration: {
                  maxAgeSeconds: 60 * 60 * 24 * 14,
                  maxEntries: 60,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: ({ request, url }) =>
                request.destination === "font" &&
                url.pathname.startsWith("/fonts/"),
              handler: "CacheFirst",
              options: {
                cacheName: "teamforge-fonts",
                expiration: {
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                  maxEntries: 4,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
      changedFileLintPlugin(),
      ...getSentryBuildPlugins(command),
    ],
    server: {
      port: 3000,
      watch: {
        ignored: [
          "**/dev-dist/**",
          "**/dist/**",
          "**/reports/**",
          "**/temp/**",
        ],
      },
    },
    test: {
      environment: "node",
      setupFiles: ["./test/setup/vitest.setup.ts"],
      env: {
        VITE_API_URL: "http://localhost:6969/api/v1",
        VITE_APP_URL: "http://localhost:3000",
        VITE_MEDIA_BASE_URL: "http://localhost:6969/media",
      },
    },
    build: {
      sourcemap: shouldUploadSentrySourcemaps,
      rollupOptions: {
        output: {
          manualChunks(id) {
            return getNodeModuleChunkName(id);
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@test": path.resolve(__dirname, "./test"),
      },
    },
  };
});
