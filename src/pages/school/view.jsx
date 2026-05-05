import * as React from "react";
import Box from "@mui/joy/Box";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import YearTable from "./tabs/session"
import Payment from "./tabs/payment";
import Result from "./tabs/result";


// Configuration object for tabs
const tabConfig = [
  { label: "Session", content: <YearTable/> },
  { label: "Payment", content: <Payment/> },
  { label: "Result", content: <Result/> },
];

// TabList component abstraction
function CustomTabList({ tabs, ...props }) {
  return (
    <TabList
      sx={{
        pt: 1,
        overflowX: "auto",
        flexWrap: "nowrap",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
        justifyContent: "flex-start",
        [`&& .${tabClasses.root}`]: {
          flex: "initial",
          bgcolor: "transparent",
          "&:hover": {
            bgcolor: "transparent",
          },
          [`&.${tabClasses.selected}`]: {
            color: "primary.plainColor",
            "&::after": {
              height: 2,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
              bgcolor: "primary.500",
            },
          },
        },
      }}
      {...props}
    >
      {tabs.map((tab, index) => (
        <Tab key={index} indicatorInset>
          {tab.label}
        </Tab>
      ))}
    </TabList>
  );
}

// TabPanel container abstraction
function TabPanelContainer({ children }) {
  return (
    <Box
      sx={(theme) => ({
        "--bg": theme.vars.palette.background.surface,
        background: "var(--bg)",
        boxShadow: "0 0 0 100vmax var(--bg)",
        clipPath: "inset(0 -100vmax)",
      })}
    >
      {children}
    </Box>
  );
}

export default function School() {
  const [index, setIndex] = React.useState(0);

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowX: "hidden",
      }}
    >
      <Tabs
        aria-label="Pipeline"
        value={index}
        onChange={(event, value) => setIndex(value)}
      >
        <CustomTabList tabs={tabConfig} />
        <TabPanelContainer>
          {tabConfig.map((tab, idx) => (
            <TabPanel key={idx} value={idx}>
              {tab.content}
            </TabPanel>
          ))}
        </TabPanelContainer>
      </Tabs>
    </Box>
  );
}





