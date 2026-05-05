import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Chip from "@mui/joy/Chip";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import Alert from "@mui/joy/Alert";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import fetchService from "../../component/fetch";
import pdfLogo from "../../assets/icon_pdf.svg";
import PDFViewer from "./components/pdf-viewer";

const getDocuments = async () => {
  const response = await fetchService.get("/api/v1/student/me/documents");
  if (!response.ok) throw new Error(response.message);
  const data = response.data?.data;
  return Array.isArray(data) ? data : [];
};

function SkeletonCard() {
  return (
    <Box
      sx={{
        borderRadius: "xl",
        overflow: "hidden",
        bgcolor: "background.level2",
        animation: "pulse 1.5s ease-in-out infinite",
        "@keyframes pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
      }}
    >
      <Box sx={{ width: "100%", paddingBottom: "56.25%", bgcolor: "background.level3" }} />
      <Box sx={{ p: 1.5 }}>
        <Box sx={{ height: 14, width: "70%", borderRadius: "sm", bgcolor: "background.level3", mb: 1 }} />
        <Box sx={{ height: 11, width: "40%", borderRadius: "sm", bgcolor: "background.level3" }} />
      </Box>
    </Box>
  );
}

function EmptyState({ label }) {
  return (
    <Stack alignItems="center" sx={{ py: 8, gap: 1 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "xl",
          bgcolor: "background.level2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.tertiary",
        }}
      >
        <FolderRoundedIcon sx={{ fontSize: 28 }} />
      </Box>
      <Typography level="title-md" fontWeight={700}>
        No {label} documents
      </Typography>
      <Typography level="body-sm" textColor="text.secondary">
        Documents shared with you will appear here.
      </Typography>
    </Stack>
  );
}

function DocGrid({ docs, onOpen }) {
  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          md: "repeat(4, minmax(0, 1fr))",
          lg: "repeat(5, minmax(0, 1fr))",
        },
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      {docs.map((doc) => (
        <Card
          key={doc._id}
          variant="outlined"
          size="sm"
          sx={{
            cursor: "pointer",
            borderRadius: "xl",
            transition: "transform 120ms ease, box-shadow 120ms ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: "md" },
            p: 0,
            overflow: "hidden",
          }}
          onClick={() => onOpen(doc)}
        >
          {/* Thumbnail */}
          <CardOverflow sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
            <AspectRatio ratio="4/3">
              <img
                alt={doc.title}
                src={pdfLogo || "default-thumbnail.png"}
                style={{ objectFit: "contain", background: "var(--joy-palette-background-level1)", padding: 16 }}
              />
            </AspectRatio>
          </CardOverflow>

          {/* Info row */}
          <Box
            sx={{
              p: { xs: 1, sm: 1.5 },
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 0.5,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography level="body-sm" fontWeight={600} noWrap>
                {doc.title}
              </Typography>
              <Typography level="body-xs" textColor="text.secondary">
                {doc?.course?.code || "—"} · {formatFileSize(doc.size)}
              </Typography>
            </Box>
            <Dropdown>
              <MenuButton
                slots={{ root: "div" }}
                slotProps={{ root: { style: { display: "inline-flex", cursor: "pointer" } } }}
                variant="plain"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                sx={{
                  p: 0.25,
                  borderRadius: "sm",
                  minHeight: "unset",
                  color: "text.tertiary",
                  flexShrink: 0,
                }}
              >
                <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
              </MenuButton>
              <Menu size="sm" sx={{ zIndex: 9999 }}>
                <MenuItem onClick={(e) => e.stopPropagation()}>Share</MenuItem>
                <MenuItem onClick={(e) => e.stopPropagation()}>Download</MenuItem>
              </Menu>
            </Dropdown>
          </Box>
        </Card>
      ))}
    </Box>
  );
}

export default function Resource() {
  const [tabIndex, setTabIndex] = React.useState(0);
  const [selectedPDF, setSelectedPDF] = React.useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });

  const documents = Array.isArray(data) ? data : [];
  const publicDocs = documents.filter((doc) => doc.isPublic);
  const sharedDocs = documents.filter((doc) => !doc.isPublic);

  if (selectedPDF) {
    return (
      <PDFViewer
        fileUrl={selectedPDF.file}
        fileName={selectedPDF.title}
        onClose={() => setSelectedPDF(null)}
      />
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Page header */}
      <Box sx={{ mb: 2 }}>
        <Typography level="h4" fontWeight={800}>
          Resources
        </Typography>
        <Typography level="body-sm" textColor="text.secondary">
          Documents and materials shared with you.
        </Typography>
      </Box>

      <Tabs
        aria-label="Document Resources"
        value={tabIndex}
        onChange={(e, value) => setTabIndex(value)}
      >
        <TabList
          sx={{
            pt: 0,
            mb: 2,
            overflowX: "auto",
            flexWrap: "nowrap",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            [`&& .${tabClasses.root}`]: {
              flex: "initial",
              bgcolor: "transparent",
              "&:hover": { bgcolor: "transparent" },
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
        >
          <Tab indicatorInset>
            Public
            {publicDocs.length > 0 && (
              <Chip size="sm" variant="soft" color={tabIndex === 0 ? "primary" : "neutral"} sx={{ ml: 0.75 }}>
                {publicDocs.length}
              </Chip>
            )}
          </Tab>
          <Tab indicatorInset>
            Shared
            <Chip size="sm" variant="soft" color={tabIndex === 1 ? "primary" : "neutral"} sx={{ ml: 0.75 }}>
              {sharedDocs.length}
            </Chip>
          </Tab>
        </TabList>

        <TabPanel value={0} sx={{ p: 0 }}>
          {isLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </Box>
          ) : isError ? (
            <Alert color="danger" variant="soft" startDecorator={<WarningAmberRoundedIcon />} sx={{ borderRadius: "lg" }}>
              {error?.message || "Could not load documents."}
            </Alert>
          ) : publicDocs.length === 0 ? (
            <EmptyState label="public" />
          ) : (
            <DocGrid docs={publicDocs} onOpen={setSelectedPDF} />
          )}
        </TabPanel>

        <TabPanel value={1} sx={{ p: 0 }}>
          {isLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </Box>
          ) : isError ? (
            <Alert color="danger" variant="soft" startDecorator={<WarningAmberRoundedIcon />} sx={{ borderRadius: "lg" }}>
              {error?.message || "Could not load documents."}
            </Alert>
          ) : sharedDocs.length === 0 ? (
            <EmptyState label="shared" />
          ) : (
            <DocGrid docs={sharedDocs} onOpen={setSelectedPDF} />
          )}
        </TabPanel>
      </Tabs>
    </Box>
  );
}
