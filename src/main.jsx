import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "@fontsource/inter";
import { CircularProgress } from "@mui/joy";
import ThemesProvider from "./themes.jsx";
import configs from "./configs.js";

if (typeof document !== "undefined") {
  document.title = configs.branding.pageTitle;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemesProvider>
      <Suspense
        fallback={
          <CircularProgress
            sx={{ position: "absolute", bottom: "50%", right: "50%" }}
            thickness={2}
            size="lg"
            value={150}
            variant="soft"
          />
        }
      >
        <App />
      </Suspense>
    </ThemesProvider>
  </React.StrictMode>
);
