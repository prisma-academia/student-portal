/**
 * Single source for all environment configuration.
 * All values come from VITE_* env; no fallbacks. Throws on missing required vars.
 */

const env = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

const REQUIRED = [
  "VITE_API_BASE_URL",
  "VITE_APP_NAME",
  "VITE_APP_SHORT_NAME",
  "VITE_PAGE_TITLE",
  "VITE_LOGO_URL",
  "VITE_LOGO_ALT",
  "VITE_FAVICON_PATH",
  "VITE_PRIMARY_COLOR",
  "VITE_THEME_COLOR",
  "VITE_MANIFEST_BG_COLOR",
  "VITE_AUTH_BACKGROUND_URL",
  "VITE_AUTH_BACKGROUND_URL_DARK",
  "VITE_FOOTER_TEXT",
  "VITE_CALENDAR_DEPARTMENT_BG",
  "VITE_CALENDAR_DEPARTMENT_HOVER",
  "VITE_CALENDAR_CLASS_BG",
  "VITE_CALENDAR_CLASS_HOVER",
  "VITE_CALENDAR_GENERAL_BG",
  "VITE_CALENDAR_GENERAL_HOVER",
];

function requireEnv(keys) {
  const missing = keys.filter((key) => env[key] == null || String(env[key]).trim() === "");
  if (missing.length) {
    throw new Error(
      `[configs] Missing required env: ${missing.join(", ")}. Set them in .env (see .env.example).`
    );
  }
}

requireEnv(REQUIRED);

if (!/^#[0-9A-Fa-f]{6}$/.test(env.VITE_PRIMARY_COLOR)) {
  throw new Error(
    `[configs] VITE_PRIMARY_COLOR must be a 6-digit hex (e.g. #f44336), got: ${env.VITE_PRIMARY_COLOR}`
  );
}

const primary = env.VITE_PRIMARY_COLOR;
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

const configs = {
  baseUrl: env.VITE_API_BASE_URL,

  branding: {
    appName: env.VITE_APP_NAME,
    appShortName: env.VITE_APP_SHORT_NAME,
    pageTitle: env.VITE_PAGE_TITLE,
    logoUrl: env.VITE_LOGO_URL,
    logoAlt: env.VITE_LOGO_ALT,
    faviconPath: env.VITE_FAVICON_PATH,
    primaryPalette,
    themeColor: env.VITE_THEME_COLOR,
    backgroundColor: env.VITE_MANIFEST_BG_COLOR,
    authBackgroundImageUrl: env.VITE_AUTH_BACKGROUND_URL,
    authBackgroundImageUrlDark: env.VITE_AUTH_BACKGROUND_URL_DARK,
    footerText: env.VITE_FOOTER_TEXT,
    calendarCategoryColors: {
      department: {
        bg: env.VITE_CALENDAR_DEPARTMENT_BG,
        hover: env.VITE_CALENDAR_DEPARTMENT_HOVER,
      },
      class: {
        bg: env.VITE_CALENDAR_CLASS_BG,
        hover: env.VITE_CALENDAR_CLASS_HOVER,
      },
      general: {
        bg: env.VITE_CALENDAR_GENERAL_BG,
        hover: env.VITE_CALENDAR_GENERAL_HOVER,
      },
    },
  },
};

export default configs;
