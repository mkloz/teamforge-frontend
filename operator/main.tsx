import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { OperatorApp } from "@/features/operator/operator-app";
import "./operator.css";

const rootElement = document.getElementById("operator-root");

if (!rootElement) {
  throw new Error("Operator root element not found.");
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <OperatorApp />
  </StrictMode>,
);
