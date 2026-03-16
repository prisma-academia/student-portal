import { CssBaseline, CssVarsProvider, extendTheme } from "@mui/joy";
import React from "react";
import configs from "./configs.js";

const theme = extendTheme({
  components: {
    JoyInput: {
      styleOverrides: {
        root: {
          color: "#000000",
          colorScheme: "light",
        },
      },
    },
  },
  colorSchemes: {
    light: {
      palette: {
        primary: configs.branding.primaryPalette,
      },
    },
    dark: {
      palette: {},
    },
  },
});

const calendarVarsCss = `
  :root {
    --brand-calendar-department-bg: ${configs.branding.calendarCategoryColors.department.bg};
    --brand-calendar-department-hover: ${configs.branding.calendarCategoryColors.department.hover};
    --brand-calendar-class-bg: ${configs.branding.calendarCategoryColors.class.bg};
    --brand-calendar-class-hover: ${configs.branding.calendarCategoryColors.class.hover};
    --brand-calendar-general-bg: ${configs.branding.calendarCategoryColors.general.bg};
    --brand-calendar-general-hover: ${configs.branding.calendarCategoryColors.general.hover};
  }
`;

function ThemesProvider({ children }) {
  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline />
      <style dangerouslySetInnerHTML={{ __html: calendarVarsCss }} />
      {children}
    </CssVarsProvider>
  );
}

export default ThemesProvider;
