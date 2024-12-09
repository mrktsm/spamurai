import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { crx } from "@crxjs/vite-plugin";
// import manifest from "./manifest.json";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // plugins: [react(), crx({ manifest })]
  build: {
    rollupOptions: {
      input: {
        main: "index.html", // Include the main entry point
        modal: "modal.html", // The modal HTML
        actionBar: "actionBar.html",
        dashboard: "dashboard.html",
      },
      output: {
        entryFileNames: `assets/[name].js`,
      },
    },
  },
});
