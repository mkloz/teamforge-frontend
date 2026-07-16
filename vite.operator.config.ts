import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  assertOperatorApiUrl(env.VITE_OPERATOR_API_URL);

  return {
    root: path.resolve(__dirname, "operator"),
    base: "/operator/",
    plugins: [react(), tailwindcss()],
    publicDir: path.resolve(__dirname, "operator/public"),
    server: { port: 3001 },
    build: {
      outDir: path.resolve(__dirname, "dist-operator"),
      emptyOutDir: true,
      sourcemap: false,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});

function assertOperatorApiUrl(value: string | undefined) {
  if (!value) {
    throw new Error(
      "VITE_OPERATOR_API_URL must be set to build the operator workspace.",
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("VITE_OPERATOR_API_URL must be a valid HTTP(S) URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("VITE_OPERATOR_API_URL must be a valid HTTP(S) URL.");
  }

  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !url.pathname.replace(/\/+$/u, "").endsWith("/api/v1")
  ) {
    throw new Error(
      "VITE_OPERATOR_API_URL must be a protected API base URL ending in /api/v1, without credentials, a query, or a fragment.",
    );
  }
}
