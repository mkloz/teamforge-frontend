import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import type { ManifestOptions } from "vite-plugin-pwa";
import { VitePWA } from "vite-plugin-pwa";
import { changedFileLintPlugin } from "./scripts/vite-changed-file-lint-plugin";

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

function normalizeModuleId(id: string) {
  return id.replace(/\\/g, "/");
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

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(
      command === "build"
        ? {
            babel: {
              plugins: ["babel-plugin-react-compiler"],
            },
          }
        : undefined,
    ),
    tailwindcss(),
    teamForgeManifestDevPlugin(),
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      includeAssets: [
        "favicon.svg",
        "robots.txt",
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
  ],
  server: {
    port: 3000,
    watch: {
      ignored: ["**/dev-dist/**", "**/dist/**", "**/reports/**", "**/temp/**"],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/")
          ) {
            return "framework";
          }

          if (
            id.includes("/@tanstack/react-router") ||
            id.includes("/@tanstack/react-query")
          ) {
            return "tanstack";
          }

          if (id.includes("/framer-motion/")) {
            return "motion";
          }

          if (
            id.includes("/recharts/") ||
            id.includes("/d3-") ||
            id.includes("/d3/")
          ) {
            return "charts";
          }

          if (
            id.includes("/react-hook-form/") ||
            id.includes("/@hookform/resolvers/")
          ) {
            return "forms";
          }

          if (id.includes("/zod/")) {
            return "validation";
          }

          if (
            id.includes("/@radix-ui/react-slot/") ||
            id.includes("/@radix-ui/react-compose-refs/")
          ) {
            return "radix-slot";
          }

          if (
            id.includes("/@radix-ui/react-label/") ||
            id.includes("/@radix-ui/react-tooltip/") ||
            id.includes("/@radix-ui/react-arrow/") ||
            id.includes("/@radix-ui/react-context/") ||
            id.includes("/@radix-ui/react-dismissable-layer/") ||
            id.includes("/@radix-ui/react-id/") ||
            id.includes("/@radix-ui/react-popper/") ||
            id.includes("/@radix-ui/react-portal/") ||
            id.includes("/@radix-ui/react-presence/") ||
            id.includes("/@radix-ui/react-primitive/") ||
            id.includes("/@radix-ui/react-use-callback-ref/") ||
            id.includes("/@radix-ui/react-use-controllable-state/") ||
            id.includes("/@radix-ui/react-use-escape-keydown/") ||
            id.includes("/@radix-ui/react-use-layout-effect/") ||
            id.includes("/@radix-ui/react-use-rect/") ||
            id.includes("/@radix-ui/react-use-size/") ||
            id.includes("/@radix-ui/react-visually-hidden/") ||
            id.includes("/@radix-ui/primitive/") ||
            id.includes("/@radix-ui/rect/")
          ) {
            return "radix-overlay-core";
          }

          if (
            id.includes("/@radix-ui/") ||
            id.includes("/radix-ui/") ||
            id.includes("/vaul/") ||
            id.includes("/embla-carousel-react/") ||
            id.includes("/input-otp/") ||
            id.includes("/sonner/")
          ) {
            return "ui-vendor";
          }

          const lucideChunkName = getLucideChunkName(id);

          if (lucideChunkName) {
            return lucideChunkName;
          }

          if (id.includes("/ky/")) {
            return "http-client";
          }

          if (
            id.includes("/socket.io-client/") ||
            id.includes("/socket.io-parser/") ||
            id.includes("/engine.io-client/") ||
            id.includes("/engine.io-parser/")
          ) {
            return "realtime-vendor";
          }

          if (id.includes("/@react-oauth/google/")) {
            return "auth-integrations";
          }

          if (id.includes("/@vercel/analytics/")) {
            return "analytics";
          }

          if (id.includes("/nuqs/") || id.includes("/zustand/")) {
            return "state-routing";
          }

          if (id.includes("/@chenglou/pretext/")) {
            return "text-layout";
          }

          if (
            id.includes("/class-variance-authority/") ||
            id.includes("/clsx/") ||
            id.includes("/dayjs/") ||
            id.includes("/tailwind-merge/")
          ) {
            return "utilities";
          }

          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
