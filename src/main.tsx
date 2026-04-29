import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "@/shared/providers/app-providers";
import "./index.css";

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  );
}
