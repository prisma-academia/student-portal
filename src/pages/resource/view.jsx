import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import Typography from "@mui/joy/Typography";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import Chip from "@mui/joy/Chip";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import fetchService from "../../component/fetch";
import pdfLogo from "../../assets/icon_pdf.svg";
import PDFViewer from "./components/pdf-viewer"; // Import the PDF viewer

const getDocuments = async () => {
  const response = await fetchService.get("/api/v1/student/me/documents");
  if (!response.ok) {
    throw new Error(response.message);
  }
  const data = response.data?.data;
  return Array.isArray(data) ? data : [];
};

export default function Resource() {
  const [tabIndex, setTabIndex] = React.useState(0);
  const [selectedPDF, setSelectedPDF] = React.useState(null);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });

  const documents = Array.isArray(data) ? data : [];
  const publicDocs = documents.filter((doc) => doc.isPublic);
  const sharedDocs = documents.filter((doc) => !doc.isPublic);
  const formatFileSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  const renderCard = (doc) => (
    <Card
      key={doc._id}
      variant="outlined"
      size="sm"
      sx={{ width: "200px", cursor: "pointer" }}
      onClick={() => setSelectedPDF(doc)} // Open PDF viewer
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent:"space-between", p: 1 }}>
        <Typography level="title-md" noWrap>
          {doc.title}
        </Typography>
        <Dropdown>
          <MenuButton
            variant="plain"
            size="sm"
            sx={{ maxWidth: "32px", maxHeight: "32px", borderRadius: "999px" }}
          >
            <MoreVertRoundedIcon />
          </MenuButton>
          <Menu>
            <MenuItem>
              <EditRoundedIcon /> Edit
            </MenuItem>
            <MenuItem>
              <ShareRoundedIcon /> Share
            </MenuItem>
            <MenuItem>
              <DeleteRoundedIcon /> Delete
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
      <CardOverflow>
        <AspectRatio ratio="16/9">
          <img
            alt={doc.title}
            src={pdfLogo || "default-thumbnail.png"}
            style={{ objectFit: "cover" }}
          />
        </AspectRatio>
      </CardOverflow>
      <Box sx={{ p: 1 }}>
        <Typography level="body-sm">
          {doc?.course?.code || "No course"}
        </Typography>
        <Typography level="body-xs"> {formatFileSize(doc.size)}</Typography>
      </Box>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, overflowX: "hidden" }}>
      {selectedPDF ? (
        <PDFViewer
          fileUrl={selectedPDF.file}
          fileName={selectedPDF.title}
          onClose={() => setSelectedPDF(null)}
        />
      ) : (
        <Tabs
          aria-label="Document Resources"
          value={tabIndex}
          onChange={(e, value) => setTabIndex(value)}
        >
          <TabList
            sx={{
              justifyContent: "center",
              [`&& .${tabClasses.root}`]: {
                flex: "initial",
                "&:hover": { bgcolor: "transparent" },
                [`&.${tabClasses.selected}`]: {
                  "&::after": {
                    height: 2,
                    bgcolor: "primary.500",
                  },
                },
              },
            }}
          >
            <Tab>Public</Tab>
            <Tab>
              Shared{" "}
              <Chip
                size="sm"
                variant="soft"
                color={tabIndex === 1 ? "primary" : "neutral"}
              >
                {sharedDocs.length}
              </Chip>
            </Tab>
          </TabList>

          <Box>
            <TabPanel value={0}>
              {isLoading ? (
                <Typography>Loading...</Typography>
              ) : isError ? (
                <Typography>Error fetching documents.</Typography>
              ) : publicDocs.length > 0 ? (
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {publicDocs.map(renderCard)}
                </Box>
              ) : (
                <Typography>No public documents available.</Typography>
              )}
            </TabPanel>
            <TabPanel value={1}>
              {isLoading ? (
                <Typography>Loading...</Typography>
              ) : isError ? (
                <Typography>Error fetching documents.</Typography>
              ) : sharedDocs.length > 0 ? (
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {sharedDocs.map(renderCard)}
                </Box>
              ) : (
                <Typography>No shared documents available.</Typography>
              )}
            </TabPanel>
          </Box>
        </Tabs>
      )}
    </Box>
  );
}
