import * as React from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import List from "@mui/joy/List";
import ListDivider from "@mui/joy/ListDivider";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton";
import Chip from "@mui/joy/Chip";
import fetchService from "../../../component/fetch";
import { useQuery } from "@tanstack/react-query";

export default function MemoList({ setOpenMemo, setMemo }) {
  const getMemos = async () => {
    const response = await fetchService.get("/api/v1/student/me/memos");
    if (!response.ok) {
      throw new Error(response.message);
    }
    const data = response.data?.data;
    return Array.isArray(data) ? data : [];
  };

  const {
    data: memos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["memo"],
    queryFn: getMemos,
  });

  return (
    <List
      sx={{
        [`& .${listItemButtonClasses.root}.${listItemButtonClasses.selected}`]:
          {
            borderLeft: "2px solid",
            borderLeftColor: "var(--joy-palette-primary-outlinedBorder)",
          },
      }}
    >
      {(Array.isArray(memos) ? memos : []).map((item, index) => (
        <React.Fragment key={item._id}>
          <ListItem>
            <ListItemButton
              onClick={() => {
                setOpenMemo(true);
                setMemo(item);
              }}
              {...(index === 0 && {
                selected: true,
                color: "neutral",
              })}
              sx={{ p: 2 }}
            >
              <Box sx={{ pl: 2, width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography level="body-xs" textColor="text.tertiary">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Typography>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={item.isPublic ? "success" : "neutral"}
                  >
                    {item.isPublic ? "Public" : "Private"}
                  </Chip>
                </Box>
                <div>
                  <Typography level="title-sm" sx={{ mb: 0.5 }}>
                    {item.name}
                  </Typography>
                  <Typography level="body-sm" textColor="text.secondary">
                    Created By: {item.createdBy?.name || "Unknown"}
                  </Typography>
                </div>
                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                  {Array.isArray(item.programs) ? item.programs.map((program) => (
                    <Chip key={program?.id ?? program?.name ?? program} size="sm" variant="outlined">
                      Program: {program?.name ?? program}
                    </Chip>
                  )) : null}
                  {Array.isArray(item.classLevels) ? item.classLevels.map((classLevel) => (
                    <Chip key={classLevel?.id ?? classLevel?.name ?? classLevel} size="sm" variant="outlined">
                      Level: {classLevel?.name ?? classLevel}
                    </Chip>
                  )) : null}
                </Box>
              </Box>
            </ListItemButton>
          </ListItem>
          <ListDivider sx={{ m: 0 }} />
        </React.Fragment>
      ))}
    </List>
  );
}
