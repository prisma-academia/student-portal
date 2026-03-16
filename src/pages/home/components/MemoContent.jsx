import React from "react";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Card from "@mui/joy/Card";
import CardOverflow from "@mui/joy/CardOverflow";
import Typography from "@mui/joy/Typography";
import Divider from "@mui/joy/Divider";
import AspectRatio from "@mui/joy/AspectRatio";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import FolderIcon from "@mui/icons-material/Folder";
import { Stack } from "@mui/joy";

export default function MemoModal({ setOpenMemo, memo }) {
  return (
    <Modal open={!!memo} onClose={() => setOpenMemo(false)}>
      <ModalDialog
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        sx={{
          width: { xs: "100%", sm: "70%" },
          maxWidth: { xs: "100%", sm: 900 },
          height: { xs: "100vh", sm: "auto" },
          margin: { xs: 0, sm: "auto" },
          p: 3,
          borderRadius: 2,
          overflow: "auto",
        }}
      >
        <ModalClose onClick={() => setOpenMemo(false)} />

        <Typography id="modal-title" component="h2" sx={{ mb: 2 }}>
          Memo Details
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography level="body-sm" textColor="text.tertiary">
            {memo?.author || "Unknown Author"}
          </Typography>
          <Typography level="body-xs" textColor="text.tertiary">
            {memo?.createdAt || "Unknown Date"}
          </Typography>
        </Stack>

        <Typography
          level="body-md"
          fontWeight={600}
          textColor="text.tertiary"
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
        >
          {memo?.title || "Untitled"}
          <Chip
            size="sm"
            variant="outlined"
            color={memo?.color?.split(".")[0] || "neutral"}
          >
            {memo?.category || "General"}
          </Chip>
        </Typography>

        <div
          dangerouslySetInnerHTML={{ __html: memo?.html || "<p>No content</p>" }}
        ></div>

        <Divider sx={{ mt: 3 }} />
      </ModalDialog>
    </Modal>
  );
}
