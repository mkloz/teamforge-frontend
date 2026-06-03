import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/app";
import { redirectLocalIpToLocalhost } from "@/shared/lib/local-host-canonical-url";
import "./index.css";

const BRANDED_BOOT_DURATION_MS = 2_000;
const FAST_BOOT_DURATION_MS = 0;
const FAST_BOOT_PUBLIC_PATH_PREFIXES = [
  "/auth/",
  "/download",
  "/onboarding/",
  "/privacy",
  "/terms",
] as const;
const PWA_LAUNCH_SOURCE = "pwa";

type BootWindow = Window & {
  __TEAMFORGE_BOOT_STARTED_AT?: number;
};

const isRedirectingToLocalhost = redirectLocalIpToLocalhost();
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found.");
}

const appRootElement = rootElement;

function getBootRenderDelay() {
  const bootStartedAt =
    (window as BootWindow).__TEAMFORGE_BOOT_STARTED_AT ?? performance.now();
  const bootElapsedMs = performance.now() - bootStartedAt;
  const minimumBootDurationMs = getMinimumBootDurationMs();

  return Math.max(0, minimumBootDurationMs - bootElapsedMs);
}

function getMinimumBootDurationMs() {
  const { pathname, search } = window.location;
  const source = new URLSearchParams(search).get("source");

  if (source?.startsWith(PWA_LAUNCH_SOURCE)) {
    return FAST_BOOT_DURATION_MS;
  }

  if (
    pathname === "/" ||
    FAST_BOOT_PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return FAST_BOOT_DURATION_MS;
  }

  return BRANDED_BOOT_DURATION_MS;
}

function renderApp() {
  ReactDOM.createRoot(appRootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

if (!isRedirectingToLocalhost) {
  const bootRenderDelay = getBootRenderDelay();

  if (bootRenderDelay > 0) {
    window.setTimeout(renderApp, bootRenderDelay);
  } else {
    renderApp();
  }
}
