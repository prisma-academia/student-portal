/**
 * Generates site.webmanifest from env. Uses same required VITE_* vars as configs.js.
 * No fallbacks; throws if any required env is missing.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = process.env;

const REQUIRED = [
  "VITE_APP_NAME",
  "VITE_APP_SHORT_NAME",
  "VITE_THEME_COLOR",
  "VITE_MANIFEST_BG_COLOR",
];

function requireEnv(keys) {
  const missing = keys.filter((key) => env[key] == null || String(env[key]).trim() === "");
  if (missing.length) {
    throw new Error(
      `[generate-manifest] Missing required env: ${missing.join(", ")}. Set them in .env (see .env.example).`
    );
  }
}

export function run() {
  requireEnv(REQUIRED);
  const manifest = {
    name: env.VITE_APP_NAME,
    short_name: env.VITE_APP_SHORT_NAME,
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: env.VITE_THEME_COLOR,
    background_color: env.VITE_MANIFEST_BG_COLOR,
    display: "standalone",
  };
  const outDir = path.join(__dirname, "..", "public", "favicon");
  const outPath = path.join(outDir, "site.webmanifest");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf8");
}
