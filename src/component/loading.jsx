import { CircularProgress, Modal } from "@mui/joy";
import React from "react";

function Loading({ isLoading = false }) {
  return (
    <Modal open={isLoading}>
      <CircularProgress
        sx={{ position: "absolute", bottom: "50%", right: "50%" }}
        thickness={2}
        size="lg"
        value={150}
        variant="soft"
      />
    </Modal>
  );
}

export default Loading;
