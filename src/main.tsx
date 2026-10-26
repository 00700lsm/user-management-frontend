import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/App";
import { AuthProvider } from "./app/providers/AuthProvider";
import { SessionQueryProvider } from "./app/providers/SessionQueryProvider";
import "./shared/ui/styles/tokens.css";
import "./shared/ui/styles/global.css";

// The mock module and service worker are only imported in local dev mode.
async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === "true") {
    const { worker } = await import("./shared/mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
  const root = document.getElementById("root");
  if (!root) throw new Error("Missing #root");
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <SessionQueryProvider>
            <App />
          </SessionQueryProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>,
  );
}
void bootstrap();
