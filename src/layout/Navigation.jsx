import * as React from "react";
import List from "@mui/joy/List";
import ListSubheader from "@mui/joy/ListSubheader";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListItemContent from "@mui/joy/ListItemContent";
import Tooltip from "@mui/joy/Tooltip";

import useNavConfig from "./nav-list";
import { usePathname } from "../component/use-pathname";
import RouterLink from "../component/router-link";

export default function Navigation({ drawer = false }) {
  const nav_list = useNavConfig();
  const pathname = usePathname();

  return (
    <List
      size="sm"
      sx={{
        "--ListItem-radius": "var(--joy-radius-sm)",
        "--List-gap": "4px",
        px: drawer ? 1 : 0,
      }}
    >
      <ListItem nested>
        <ListSubheader
          sx={{
            letterSpacing: "2px",
            fontWeight: 800,
            fontSize: "0.65rem",
            display: drawer ? "block" : { sm: "none", md: "block" },
            mb: 0.5,
          }}
        >
          Browse
        </ListSubheader>
        <List sx={{ "& .JoyListItemButton-root": { p: "8px" } }}>
          {nav_list.map((item) => {
            const isActive = pathname === item.path;
            const button = (
              <ListItem
                key={item.path}
                style={{ textDecoration: "none" }}
                component={RouterLink}
                href={item.path}
              >
                <ListItemButton
                  selected={isActive}
                  sx={{
                    justifyContent: drawer
                      ? "flex-start"
                      : { sm: "center", md: "flex-start" },
                    borderRadius: "sm",
                    "&.Mui-selected": {
                      color: "primary.plainColor",
                      "& .MuiSvgIcon-root": { color: "primary.500" },
                    },
                  }}
                >
                  <ListItemDecorator
                    sx={{ mr: drawer ? 1 : { sm: 0, md: 1 } }}
                  >
                    {item.icon}
                  </ListItemDecorator>
                  <ListItemContent
                    sx={{
                      textTransform: "capitalize",
                      display: drawer ? "block" : { sm: "none", md: "block" },
                    }}
                  >
                    {item.title}
                  </ListItemContent>
                </ListItemButton>
              </ListItem>
            );

            /* tooltip for icon-only mode (sm sidebar, not drawer) */
            if (!drawer) {
              return (
                <Tooltip
                  key={item.path}
                  title={item.title}
                  placement="right"
                  variant="soft"
                  sx={{ display: { sm: "block", md: "none" }, textTransform: "capitalize" }}
                >
                  <span>{button}</span>
                </Tooltip>
              );
            }
            return button;
          })}
        </List>
      </ListItem>
    </List>
  );
}
