import * as React from "react";
import { useColorScheme } from "@mui/joy/styles";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Avatar from "@mui/joy/Avatar";
import Input from "@mui/joy/Input";
import Tooltip from "@mui/joy/Tooltip";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import ListDivider from "@mui/joy/ListDivider";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import Logo from "../component/logo";
import { useAuthStore } from "../store";
import configs from "../configs";
import { useNavigate } from "react-router-dom";

function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <IconButton size="sm" variant="outlined" color="primary" />;
  }
  return (
    <Tooltip title="Change theme" variant="outlined">
      <IconButton
        id="toggle-mode"
        size="sm"
        variant="plain"
        color="neutral"
        sx={{ alignSelf: "center" }}
        onClick={() => setMode(mode === "light" ? "dark" : "light")}
      >
        {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default function Header({ onMenuClick }) {
  const { user, logOut } = useAuthStore();
  const navigate = useNavigate();
  const avatarSrc = user?.picture ? `${configs.baseUrl}${user.picture}` : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Left: hamburger on mobile, logo+name on desktop */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ display: { xs: "flex", sm: "none" } }}>
          <IconButton size="sm" variant="plain" color="neutral" onClick={onMenuClick}>
            <MenuRoundedIcon />
          </IconButton>
        </Box>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ display: { xs: "none", sm: "flex" } }}
        >
          <IconButton
            size="md"
            variant="outlined"
            color="neutral"
            sx={{ borderRadius: "50%" }}
          >
            <Logo />
          </IconButton>
          <Typography level="title-sm" fontWeight={700}>
            {configs.branding.appShortName}
          </Typography>
        </Stack>
      </Stack>

      {/* Right: search + theme toggle + user menu */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Input
          size="sm"
          variant="outlined"
          placeholder="Search anything…"
          startDecorator={<SearchRoundedIcon color="primary" />}
          endDecorator={
            <IconButton
              variant="outlined"
              color="neutral"
              sx={{ bgcolor: "background.level1" }}
            >
              <Typography level="title-sm" textColor="text.icon">
                ⌘ K
              </Typography>
            </IconButton>
          }
          sx={{
            alignSelf: "center",
            display: { xs: "none", sm: "flex" },
          }}
        />
        <ColorSchemeToggle />
        <Dropdown>
          <MenuButton
            variant="plain"
            size="sm"
            sx={{
              maxWidth: "32px",
              maxHeight: "32px",
              borderRadius: "9999px",
              p: 0,
            }}
          >
            <Avatar
              src={avatarSrc}
              sx={{ maxWidth: "32px", maxHeight: "32px" }}
            >
              {!avatarSrc && user?.personalInfo?.firstName
                ? user.personalInfo.firstName[0].toUpperCase()
                : undefined}
            </Avatar>
          </MenuButton>
          <Menu
            placement="bottom-end"
            size="sm"
            sx={{
              zIndex: 99999,
              p: 1,
              gap: 1,
              "--ListItem-radius": "var(--joy-radius-sm)",
            }}
          >
            <MenuItem>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={avatarSrc}
                  sx={{ borderRadius: "50%", width: 36, height: 36 }}
                >
                  {!avatarSrc && user?.personalInfo?.firstName
                    ? user.personalInfo.firstName[0].toUpperCase()
                    : undefined}
                </Avatar>
                <Box sx={{ ml: 1.5 }}>
                  <Typography level="title-sm" textColor="text.primary">
                    {`${user?.personalInfo?.firstName ?? ""} ${user?.personalInfo?.lastName ?? ""}`.trim() || "Student"}
                  </Typography>
                  <Typography level="body-xs" textColor="text.tertiary">
                    {user?.regNumber ?? ""}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <ListDivider />
            <MenuItem onClick={() => navigate("/profile")}>
              <PersonRoundedIcon />
              Profile
            </MenuItem>
            <ListDivider />
            <MenuItem onClick={() => logOut()}>
              <LogoutRoundedIcon />
              Log out
            </MenuItem>
          </Menu>
        </Dropdown>
      </Stack>
    </Box>
  );
}
