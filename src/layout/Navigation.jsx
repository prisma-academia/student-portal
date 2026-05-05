import * as React from "react";
import List from "@mui/joy/List";
import ListSubheader from "@mui/joy/ListSubheader";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListItemContent from "@mui/joy/ListItemContent";

import useNavConfig from "./nav-list";
import { usePathname } from "../component/use-pathname";
import RouterLink from "../component/router-link";

export default function Navigation() {
  const nav_list = useNavConfig();
  const pathname = usePathname();
  return (
    <List
      size="sm"
      sx={{
        "--ListItem-radius": "var(--joy-radius-sm)",
        "--List-gap": "4px",
      }}
    >
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>
          Browse
        </ListSubheader>
        <List
          aria-labelledby="nav-list-browse"
          sx={{
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          {nav_list.map((item) => (
            <ListItem
              key={item.path}
              style={{ textDecoration: "none" }}
              component={RouterLink}
              href={item.path}
            >
              <ListItemButton
                selected={pathname === item.path}
                sx={{
                  "&.Mui-selected": {
                    color: "primary.plainColor",
                    "& .MuiSvgIcon-root": { color: "primary.500" },
                  },
                }}
              >
                <ListItemDecorator>
                  {item.icon}
                </ListItemDecorator>
                <ListItemContent sx={{ textTransform: "capitalize", width: 120 }}>
                  {item.title}
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </ListItem>
    </List>
  );
}
