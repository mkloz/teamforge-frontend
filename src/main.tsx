import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app/app";
import { redirectLocalIpToLocalhost } from "@/shared/lib/local-host-canonical-url";
import "./index.css";

const isRedirectingToLocalhost = redirectLocalIpToLocalhost();
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found.");
}

if (!isRedirectingToLocalhost) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
