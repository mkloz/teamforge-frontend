import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/app";
import { redirectLocalIpToLocalhost } from "@/shared/lib/local-host-canonical-url";
import "./index.css";

const MINIMUM_BOOT_DURATION_MS = 2_000;

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

  return Math.max(0, MINIMUM_BOOT_DURATION_MS - bootElapsedMs);
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
