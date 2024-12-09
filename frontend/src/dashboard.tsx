import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const Dashboard = () => {
  return <div>Hello, I'm a functional component!</div>;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>
);
