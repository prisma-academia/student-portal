import router from "./router";
import { RouterProvider } from "react-router-dom";
import Snackbar from "@mui/joy/Snackbar";
import { useEffect } from "react";
import Loading from "./component/loading";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSnackStore, useErrorModalStore } from "./store";
import ErrorModal from "./component/ErrorModal";
import AppErrorBoundary from "./component/AppErrorBoundary";

function App() {
  const { message, variant, setAlert } = useSnackStore();
  const { showError } = useErrorModalStore();
  const queryClient = new QueryClient();

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setAlert({ message: null, variant: null });
      }, 4000);
    }
  }, [message]);

  useEffect(() => {
    const handleError = (event) => {
      const msg = event.message ?? "An unexpected error occurred.";
      const details = event.error?.stack ?? null;
      showError({
        title: "Error",
        message: msg,
        details,
      });
    };

    const handleUnhandledRejection = (event) => {
      const reason = event.reason;
      const msg =
        reason?.message ?? (typeof reason === "string" ? reason : "An unexpected error occurred.");
      const details = reason?.stack ?? null;
      showError({
        title: "Something went wrong",
        message: msg,
        details,
      });
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [showError]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppErrorBoundary>
        <Snackbar
          anchorOrigin={{ horizontal: "center", vertical: "top" }}
          variant="soft"
          color={variant}
          open={message ? true : false}
          children={message}
        />
        <ErrorModal />
        <Loading />
        <RouterProvider router={router} />
      </AppErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
