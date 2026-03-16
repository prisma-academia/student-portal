import React, { useState } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import Divider from "@mui/joy/Divider";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useErrorModalStore } from "../store";

export default function ErrorModal() {
  const { open, title, message, details, actions, hideError } = useErrorModalStore();
  const [showDetails, setShowDetails] = useState(false);

  const handleClose = () => {
    setShowDetails(false);
    hideError();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog
        aria-labelledby="error-modal-title"
        aria-describedby="error-modal-description"
        variant="outlined"
        color="danger"
        sx={{
          width: { xs: "100%", sm: 420 },
          maxWidth: "calc(100vw - 32px)",
          p: 3,
          borderRadius: 2,
          overflow: "auto",
          boxShadow: "lg",
        }}
      >
        <ModalClose onClick={handleClose} sx={{ "--IconButton-size": "36px" }} />

        <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 2 }}>
          <ErrorOutlineIcon
            sx={{ fontSize: 28, color: "var(--joy-palette-danger-500)", mt: 0.25 }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography id="error-modal-title" level="h5" component="h2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography
              id="error-modal-description"
              level="body-md"
              textColor="text.secondary"
              sx={{ mt: 1 }}
            >
              {message}
            </Typography>
          </Box>
        </Stack>

        {details && (
          <>
            <Button
              variant="plain"
              size="sm"
              color="neutral"
              onClick={() => setShowDetails((v) => !v)}
              sx={{ alignSelf: "flex-start", px: 0 }}
            >
              {showDetails ? "Hide details" : "Show details"}
            </Button>
            {showDetails && (
              <Box
                component="pre"
                sx={{
                  fontSize: "xs",
                  fontFamily: "monospace",
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "background.level1",
                  overflow: "auto",
                  maxHeight: 160,
                }}
              >
                {details}
              </Box>
            )}
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
          {actions?.map((action, i) => (
            <Button
              key={i}
              variant={action.variant ?? "soft"}
              color={action.color ?? "neutral"}
              size="md"
              onClick={() => {
                if (typeof action.onClick === "function") action.onClick();
              }}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
