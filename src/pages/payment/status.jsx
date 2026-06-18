import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/joy";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import fetchService from "../../component/fetch";
import RouterLink from "../../component/router-link";

async function verifyPayment(reference) {
  const response = await fetchService.postPublic("/api/v1/payment/verify", {
    reference,
  });
  if (!response.ok) {
    throw new Error(response.message);
  }
  const body = response.data;
  if (body && body.ok === false) {
    throw new Error(body.message || "Payment verification failed");
  }
  return body;
}

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const status = searchParams.get("status");
  const reference = searchParams.get("reference");

  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verified, setVerified] = useState(false);

  const isSuccess = status === "success";
  const isFailed = status === "failed";
  const hasParams = Boolean(status && reference);

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;
    setVerifying(true);
    setVerifyError("");

    verifyPayment(reference)
      .then(() => {
        if (cancelled) return;
        setVerified(true);
        queryClient.invalidateQueries({ queryKey: ["fees"] });
      })
      .catch((err) => {
        if (cancelled) return;
        setVerifyError(err.message || "Could not verify payment");
      })
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reference, queryClient]);

  const handleBack = () => {
    navigate("/school?tab=payment");
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 560, mx: "auto", py: 2 }}>
      <Box>
        <Typography level="h4" fontWeight={800}>
          Payment status
        </Typography>
        <Typography level="body-sm" textColor="text.secondary">
          Result of your recent payment attempt.
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          {!hasParams && (
            <Stack spacing={2} alignItems="center" sx={{ py: 3, textAlign: "center" }}>
              <HelpOutlineRoundedIcon sx={{ fontSize: 48, color: "neutral.500" }} />
              <Typography level="title-md">Invalid return link</Typography>
              <Typography level="body-sm" textColor="text.secondary">
                This page expects payment status details from the gateway. Return to
                fees and try again if you were paying a fee.
              </Typography>
              <Button component={RouterLink} href="/school?tab=payment" variant="solid">
                Back to fees
              </Button>
            </Stack>
          )}

          {hasParams && verifying && (
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size="md" />
              <Typography level="body-sm" textColor="text.secondary">
                Confirming your payment…
              </Typography>
            </Stack>
          )}

          {hasParams && !verifying && isSuccess && (
            <Stack spacing={2} alignItems="center" sx={{ py: 3, textAlign: "center" }}>
              <CheckCircleRoundedIcon color="success" sx={{ fontSize: 52 }} />
              <Typography level="title-lg" color="success">
                Payment successful
              </Typography>
              <Typography level="body-sm" textColor="text.secondary">
                {verified
                  ? "Your payment has been recorded."
                  : "Payment was accepted by the gateway."}
              </Typography>
              {reference && (
                <Typography level="body-xs" textColor="text.tertiary">
                  Reference: {reference}
                </Typography>
              )}
              {verifyError && (
                <Typography level="body-sm" color="warning">
                  {verifyError}
                </Typography>
              )}
              <Button onClick={handleBack} variant="solid">
                Back to fees
              </Button>
            </Stack>
          )}

          {hasParams && !verifying && isFailed && (
            <Stack spacing={2} alignItems="center" sx={{ py: 3, textAlign: "center" }}>
              <ErrorOutlineRoundedIcon color="error" sx={{ fontSize: 52 }} />
              <Typography level="title-lg" color="danger">
                Payment failed
              </Typography>
              <Typography level="body-sm" textColor="text.secondary">
                The payment was not completed. You can try again from the fees page.
              </Typography>
              {reference && (
                <Typography level="body-xs" textColor="text.tertiary">
                  Reference: {reference}
                </Typography>
              )}
              {verifyError && (
                <Typography level="body-sm" color="danger">
                  {verifyError}
                </Typography>
              )}
              <Button onClick={handleBack} variant="solid" color="neutral">
                Back to fees
              </Button>
            </Stack>
          )}

          {hasParams && !verifying && !isSuccess && !isFailed && (
            <Stack spacing={2} alignItems="center" sx={{ py: 3, textAlign: "center" }}>
              <HelpOutlineRoundedIcon sx={{ fontSize: 48, color: "neutral.500" }} />
              <Typography level="title-md">Unknown status</Typography>
              <Typography level="body-sm" textColor="text.secondary">
                Status: {status}
              </Typography>
              <Button onClick={handleBack} variant="solid">
                Back to fees
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
