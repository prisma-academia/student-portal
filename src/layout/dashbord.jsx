import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import Layout from "./Layout";
import Header from "./Header";
import Navigation from "./Navigation";
import useNavConfig from "./nav-list";
import { usePathname } from "../component/use-pathname";
import RouterLink from "../component/router-link";
import { useAuthStore } from "../store";
import { Navigate } from "react-router-dom";
import { theme } from "../themes";
import Logo from "../component/logo";
import configs from "../configs";

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

      {/* Mobile drawer */}
      {drawerOpen && (
        <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
          {/* Drawer header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <IconButton
              size="sm"
              variant="outlined"
              color="neutral"
              sx={{ borderRadius: "50%", flexShrink: 0 }}
            >
              <Logo />
            </IconButton>
            <Typography level="title-sm" fontWeight={700} sx={{ flex: 1 }}>
              {configs.branding.appShortName}
            </Typography>
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => setDrawerOpen(false)}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          {/* Drawer nav */}
          <Box sx={{ flex: 1, overflow: "auto", pt: 1 }}>
            <Navigation drawer />
          </Box>
        </Layout.SideDrawer>
      )}

      {/* Mobile bottom tab bar */}
      <Stack
        id="tab-bar"
        direction="row"
        justifyContent="space-around"
        sx={{
          display: { xs: "flex", sm: "none" },
          zIndex: 999,
          bottom: 0,
          position: "fixed",
          width: "100dvw",
          pt: 1,
          pb: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
          backgroundColor: "background.surface",
          borderTop: "1px solid",
          borderColor: "divider",
          boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {nav_list.map((item) => {
          const isActive = item.path === pathname;
          return (
            <Button
              key={item.path}
              variant={isActive ? "soft" : "plain"}
              color={isActive ? "primary" : "neutral"}
              aria-pressed={isActive}
              component={RouterLink}
              href={item.path}
              size="sm"
              startDecorator={item.icon}
              sx={{
                flexDirection: "column",
                "--Button-gap": 0,
                fontSize: "0.625rem",
                fontWeight: isActive ? 700 : 500,
                borderRadius: "lg",
                px: 2.5,
                py: 0.75,
                minWidth: 64,
              }}
            >
              {item.title}
            </Button>
          );
        })}
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
            p: { xs: 2, sm: 2, md: 3 },
            pb: {
              xs: "calc(env(safe-area-inset-bottom, 0px) + 80px)",
              sm: 3,
            },
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
