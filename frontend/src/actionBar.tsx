import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ActionBar from "./components/ActionBar";
import "./index.css";
// import ProgressCircle from "./components/ProgressCricle";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ActionBar />
  </StrictMode>
);
