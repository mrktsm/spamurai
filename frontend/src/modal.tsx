import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import OAuthModal from "./OAuthModal.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OAuthModal />
  </StrictMode>
);
