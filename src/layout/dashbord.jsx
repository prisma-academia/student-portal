import * as React from "react";
import { CssVarsProvider } from "@mui/joy/styles";
import { FocusTrap } from "@mui/base/FocusTrap";
import CssBaseline from "@mui/joy/CssBaseline";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";

import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import Layout from "./Layout";
import Header from "./Header";
import Navigation from "./Navigation";
import useNavConfig from "./nav-list";
import { usePathname } from "../component/use-pathname";
import RouterLink from "../component/router-link";
import { Breadcrumbs, Divider } from "@mui/joy";
import { useAuthStore } from "../store";
import { Link, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import configs from "../configs";

export default function DashboardLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const nav_list = useNavConfig();
  const pathname = usePathname();

  const isAuth = useAuthStore((state) => state.user);
  if (!isAuth) {
    return <Navigate to={"/auth/sign-in"} />;
  }
  // const socket = io(configs.baseUrl);
  // socket.on("connect", () => {
  //   console.log("Connected to the socket server");
  //   socket.emit("register", isAuth.email);
  // });
  // socket.on("message", (msg) => {
  //   console.log(`message from server ${msg}`);
  // });
  // socket.on("private_message", (msg) => {
  //   console.log(`private_message from server ${msg}`);
  // });

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      {drawerOpen && (
        <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
          <Navigation />
        </Layout.SideDrawer>
      )}
      <Stack
        id="tab-bar"
        direction="row"
        justifyContent="space-around"
        spacing={1}
        sx={{
          display: { xs: "flex", sm: "none" },
          zIndex: "999",
          bottom: 0,
          position: "fixed",
          width: "100dvw",
          py: 2,
          backgroundColor: "background.body",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {nav_list.map((item) => (
          <Button
            variant="plain"
            color="neutral"
            aria-pressed={item.path === pathname}
            component={RouterLink}
            href={item.path}
            size="sm"
            startDecorator={item.icon}
            sx={{ flexDirection: "column", "--Button-gap": 0 }}
          >
            {item.title}
          </Button>
        ))}
      </Stack>
      <Layout.Root
        sx={{
          ...(drawerOpen && {
            height: "100vh",
            overflow: "hidden",
          }),
        }}
      >
        <Layout.Header>
          <Header />
        </Layout.Header>
        <Layout.SideNav>
          <Navigation />
        </Layout.SideNav>
        <Box>
          {/* <Breadcrumbs  size="sm" separator=">">
            <Link>Home</Link>
            <Link>Second</Link>
          </Breadcrumbs> */}
          {/* <Typography
            level="title-lg"
            textColor="var(--joy-palette-success-plainColor)"
          >
            Label
          </Typography>
          <Divider sx={{ m: 2 }} /> */}
          {children}
        </Box>
      </Layout.Root>
    </CssVarsProvider>
  );
}
