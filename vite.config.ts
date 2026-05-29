import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { changedFileLintPlugin } from "./scripts/vite-changed-file-lint-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
    changedFileLintPlugin(),
  ],
  server: {
    port: 3000,
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
            id.includes("/@hookform/resolvers/") ||
            id.includes("/zod/")
          ) {
            return "forms";
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

          if (id.includes("/lucide-react/")) {
            return undefined;
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
});
