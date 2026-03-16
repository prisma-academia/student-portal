import React, { useState } from "react";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import Typography from "@mui/joy/Typography";
import Tooltip from "@mui/joy/Tooltip";
import CircularProgress from "@mui/joy/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";

export default function PDFViewer({ fileUrl, fileName, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleIframeLoad = () => setLoading(false);
  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <Box
      sx={{
        height: "60%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.surface",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Close">
            <IconButton onClick={onClose} size="sm">
              <CloseIcon />
            </IconButton>
          </Tooltip>

          <Typography level="h6" sx={{ ml: 1 }}>
            {fileName}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          height: "calc(100vh - 60px)",
          flexGrow: 1,
          position: "relative",
          overflow: "auto",
          bgcolor: "background.level1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading && (
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size="lg" />
            <Typography level="body1" sx={{ mt: 2 }}>
              Loading PDF...
            </Typography>
          </Box>
        )}

        {error ? (
          <Typography level="body1" color="danger" sx={{ textAlign: "center" }}>
            Failed to load PDF. Please try again later.
          </Typography>
        ) : (
          fileUrl && (
            <iframe
              src={`https://docs.google.com/gview?url=${fileUrl}&embedded=true`}
              title="PDF Viewer"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: loading ? "none" : "block",
              }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          )
        )}
      </Box>
    </Box>
  );
}
