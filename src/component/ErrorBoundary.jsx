import React from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import { showErrorModal } from "../store";

/**
 * Class component that catches React render errors in the tree below it.
 * Opens the global error modal and renders a minimal fallback with "Go home".
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    showErrorModal({
      title: "Something went wrong",
      message: error?.message ?? "An unexpected error occurred.",
      details: errorInfo?.componentStack ?? error?.stack ?? null,
    });
  }

  render() {
    if (this.state.hasError) {
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
          <Button
            variant="soft"
            color="neutral"
            onClick={() => window.location.assign("/")}
          >
            Go home
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
