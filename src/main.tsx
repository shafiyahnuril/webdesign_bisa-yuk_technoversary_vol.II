import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/typography.css";
import "./styles/base.css";
import "./styles/overlays.css";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Elemen #root tidak ditemukan");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
