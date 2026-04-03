import { ConvexProvider } from "convex/react";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { convexClient } from "./convex/client";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Missing #root element");
}

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

ReactDOM.createRoot(rootElement).render(
  convexClient ? (
    <ConvexProvider client={convexClient}>{app}</ConvexProvider>
  ) : (
    app
  ),
);
