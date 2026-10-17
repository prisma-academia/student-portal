/**
 * Single source for environment configuration.
 *
 * Only four values differ between schools and are required:
 *   VITE_API_BASE_URL, VITE_APP_NAME, VITE_LOGO_URL, VITE_PRIMARY_COLOR
 * Everything else (short name, page title, logo alt, footer, theme colours,
 * calendar colours, auth background) is derived from them.
 */

const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

const REQUIRED = ["VITE_API_BASE_URL", "VITE_APP_NAME", "VITE_LOGO_URL", "VITE_PRIMARY_COLOR"];

const read = (key) => String(env[key] ?? "").trim().replace(/^["']|["']$/g, "");

const missing = REQUIRED.filter((key) => read(key) === "");
if (missing.length) {
  throw new Error(
    `[configs] Missing required env: ${missing.join(", ")}. Set them in .env (or .env.<school> with --mode <school>) or in your host's environment settings.`
  );
}

const primary = read("VITE_PRIMARY_COLOR");
if (!/^#[0-9A-Fa-f]{6}$/.test(primary)) {
  throw new Error(`[configs] VITE_PRIMARY_COLOR must be a 6-digit hex (e.g. #f44336), got: ${primary}`);
}

const appName = read("VITE_APP_NAME");

const primaryPalette = {
  50: primary,
  100: primary,
  200: primary,
  300: primary,
  400: primary,
  500: primary,
  600: primary,
  700: primary,
  800: primary,
  900: primary,
};

// Auth side panel: a soft wash of the school colour (no image env needed).
const authBackground = `radial-gradient(120% 90% at 20% 10%, ${primary}55, transparent 60%), radial-gradient(90% 80% at 90% 90%, ${primary}33, transparent 55%)`;

const configs = {
  baseUrl: read("VITE_API_BASE_URL").replace(/\/$/, ""),

  branding: {
    appName,
    appShortName: appName,
    pageTitle: appName,
    logoUrl: read("VITE_LOGO_URL"),
    logoAlt: `${appName} logo`,
    primaryPalette,
    themeColor: primary,
    backgroundColor: "#ffffff",
    authBackground,
    authBackgroundDark: authBackground,
    footerText: `© {year} ${appName}`,
    calendarCategoryColors: {
      department: { bg: "rgb(248, 157, 157)", hover: "rgb(252, 176, 176)" },
      class: { bg: "rgb(190, 248, 157)", hover: "rgb(204, 250, 177)" },
      general: { bg: "rgb(157, 195, 248)", hover: "rgb(138, 182, 245)" },
    },
  },
};

export default configs;
