import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { initializeTeamsSDK } from "./services/teamsSDKService.ts";

async function startApp() {
  // Initialize Teams SDK first (non-blocking)
  await initializeTeamsSDK();

  // Render React app regardless of Teams SDK initialization result
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

// Start the application
startApp();
