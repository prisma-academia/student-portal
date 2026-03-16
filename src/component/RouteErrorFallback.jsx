import React, { useEffect, useRef } from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import { showErrorModal } from "../store";

/**
 * Rendered by the router as errorElement when a route throws.
 * Opens the global error modal and shows a minimal fallback with "Go home".
 */
export default function RouteErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();
  const shownRef = useRef(false);

  useEffect(() => {
    if (error && !shownRef.current) {
      shownRef.current = true;
      const message = error?.message ?? (typeof error === "string" ? error : "An unexpected error occurred.");
      const details = error?.stack ?? null;
      showErrorModal({
        title: "Something went wrong",
        message,
        details,
      });
    }
  }, [error]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography level="h4" sx={{ mb: 2 }}>
        Something went wrong
      </Typography>
      <Typography level="body-md" textColor="text.secondary" sx={{ mb: 2 }}>
        Check the error message in the modal, or go back to the home page.
      </Typography>
      <Button variant="soft" color="neutral" onClick={() => navigate("/")}>
        Go home
      </Button>
    </Box>
  );
}
