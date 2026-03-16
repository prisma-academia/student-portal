import {
  Chip,
  Divider,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";

export default function EventModal({ setEvent, event }) {
  const {
    extendedProps: { category, description } = { category: null, description: null },
  } = event || { extendedProps: {} };
  return (
    <Modal open={!!event} onClose={() => setEvent(null)}>
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
        <ModalClose onClick={() => setEvent(null)} />

        <Typography id="modal-title" component="h2" sx={{ mb: 2 }}>
          Event Details
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography level="body-sm" textColor="text.tertiary">
            {event?.location || "Unknown Location"}
          </Typography>
          <Typography level="body-xs" textColor="text.tertiary">
            {new Date(event?.start).toLocaleString() || "Unknown Start Time"}
          </Typography>
        </Stack>

        <Typography
          level="body-md"
          fontWeight={600}
          textColor="text.tertiary"
          sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
        >
          {event?.title || "Untitled Event"}
          <Chip
            size="sm"
            variant="outlined"
            color={event?.category?.split(".")[0] || "neutral"}
          >
            {category || "General"}
          </Chip>
        </Typography>

        <Typography level="body-sm" sx={{ mb: 2 }}>
          {description || "No description provided."}
        </Typography>

        {event?.url && (
          <Typography
            level="body-sm"
            textColor="primary"
            sx={{ mb: 2, textDecoration: "underline" }}
            component="a"
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Event Link
          </Typography>
        )}

        <Divider sx={{ mt: 3 }} />
      </ModalDialog>
    </Modal>
  );
}
