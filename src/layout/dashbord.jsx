import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";

import Layout from "./Layout";
import Header from "./Header";
import Navigation from "./Navigation";
import useNavConfig from "./nav-list";
import { usePathname } from "../component/use-pathname";
import RouterLink from "../component/router-link";
import { useAuthStore } from "../store";
import { Navigate } from "react-router-dom";
import { theme } from "../themes";

export default function DashboardLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const nav_list = useNavConfig();
  const pathname = usePathname();

  const isAuth = useAuthStore((state) => state.user);
  if (!isAuth) {
    return <Navigate to={"/auth/sign-in"} />;
  }

  return (
    <CssVarsProvider theme={theme} disableTransitionOnChange>
      <CssBaseline />
      {drawerOpen && (
        <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
          <Navigation />
        </Layout.SideDrawer>
      )}

      {/* Mobile bottom tab bar */}
      <Stack
        id="tab-bar"
        direction="row"
        justifyContent="space-around"
        spacing={1}
        sx={{
          display: { xs: "flex", sm: "none" },
          zIndex: 999,
          bottom: 0,
          position: "fixed",
          width: "100dvw",
          py: 1.5,
          backgroundColor: "background.surface",
          borderTop: "1px solid",
          borderColor: "divider",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {nav_list.map((item) => (
          <Button
            key={item.path}
            variant={item.path === pathname ? "soft" : "plain"}
            color={item.path === pathname ? "primary" : "neutral"}
            aria-pressed={item.path === pathname}
            component={RouterLink}
            href={item.path}
            size="sm"
            startDecorator={item.icon}
            sx={{
              flexDirection: "column",
              "--Button-gap": 0,
              fontSize: "0.65rem",
              borderRadius: "lg",
              px: 2,
            }}
          >
            {item.title}
          </Button>
        ))}
      </Stack>

      <Layout.Root
        sx={{
          ...(drawerOpen && { height: "100vh", overflow: "hidden" }),
        }}
      >
        <Layout.Header>
          <Header onMenuClick={() => setDrawerOpen(true)} />
        </Layout.Header>
        <Layout.SideNav>
          <Navigation />
        </Layout.SideNav>
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            pb: { xs: 10, sm: 3 },
            minHeight: 0,
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Layout.Root>
    </CssVarsProvider>
  );
}
