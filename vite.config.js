import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { run as generateManifest } from "./scripts/generate-manifest.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "generate-manifest",
      buildStart() {
        try {
          generateManifest();
        } catch (_) {
          // Script may run in different context; run via node in prebuild instead
        }
      },
    },
  ],
});
