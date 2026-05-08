import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import biome from "vite-plugin-biome";
import oxlint from "vite-plugin-oxlint";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
    oxlint(),
    biome(),
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
            return "icons";
          }

          if (
            id.includes("/@react-oauth/google/") ||
            id.includes("/@vercel/analytics/") ||
            id.includes("/socket.io-client/") ||
            id.includes("/socket.io-parser/") ||
            id.includes("/engine.io-client/") ||
            id.includes("/engine.io-parser/") ||
            id.includes("/ky/")
          ) {
            return "app-integrations";
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
