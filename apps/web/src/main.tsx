import { ApiClientError } from "@monorepo-demo/api";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// oxlint-disable-next-line import/no-unassigned-import
import "./index.css";
import App from "./App.tsx";

const container = document.querySelector("#root");
if (!container) {
  throw new Error("Root element #root not found");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
globalThis.addEventListener("unhandledrejection", (e) => {
  if (e.reason instanceof ApiClientError) {
    return; // 交给业务自己处理
  }
  e.preventDefault();
  reportError(e.reason);
});

globalThis.addEventListener("error", (e) => {
  if (e.error instanceof ApiClientError) {
    return;
  }
  reportError(e.error);
});
