import * as React from "react";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import Chip from "@mui/joy/Chip";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import { useMutation, useQuery } from "@tanstack/react-query";
import fetchService from "../../../component/fetch";
import millify from "millify";
import { useAuthStore } from "../../../store";
import configs from "../../../configs";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Divider from "@mui/joy/Divider";
import Button from "@mui/joy/Button";
import CircularProgress from "@mui/joy/CircularProgress";
import Alert from "@mui/joy/Alert";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";

function formatNaira(amount) {
  const num = typeof amount === "number" ? amount : Number(amount ?? 0);
  return `₦${millify(num, { precision: 2, locales: "ng-NG" })}`;
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}

function FeeDetailsModal({ open, fee, onClose, onPay, onReceipt, isPaying }) {
  if (!fee) return null;

  const titleId = "fee-details-title";
  const descId = "fee-details-desc";

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby={titleId}
        aria-describedby={descId}
        variant="outlined"
        sx={{
          width: { xs: "100%", sm: 720 },
          maxWidth: "calc(100vw - 32px)",
          p: { xs: 2, sm: 3 },
          borderRadius: "lg",
          boxShadow: "lg",
          overflow: "auto",
          maxHeight: "calc(100vh - 48px)",
        }}
      >
        <ModalClose onClick={onClose} sx={{ "--IconButton-size": "40px" }} />

        <Stack spacing={1.25} sx={{ pr: 5 }}>
          <Typography id={titleId} level="h4" component="h2" sx={{ fontWeight: 700 }}>
            {fee.name}
          </Typography>
          <Typography id={descId} level="body-sm" textColor="text.secondary">
            Review the full breakdown and continue with the appropriate action.
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          useFlexGap
          sx={{ mb: 2, flexWrap: "wrap" }}
        >
          <Card variant="soft" color="neutral" sx={{ flex: 1, minWidth: 220 }}>
            <Typography level="body-xs" textColor="text.secondary">
              Total amount
            </Typography>
            <Typography level="title-lg" sx={{ mt: 0.5 }}>
              {formatNaira(fee.amount)}
            </Typography>
          </Card>

          <Card variant="soft" color="neutral" sx={{ flex: 1, minWidth: 220 }}>
            <Typography level="body-xs" textColor="text.secondary">
              Due date
            </Typography>
            <Typography level="title-lg" sx={{ mt: 0.5 }}>
              {formatDate(fee.dueDate)}
            </Typography>
          </Card>

          <Card
            variant="soft"
            color={fee.isPaid ? "success" : "warning"}
            sx={{ flex: 1, minWidth: 220 }}
          >
            <Typography level="body-xs" textColor="text.secondary">
              Status
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
              <Chip
                variant="solid"
                size="sm"
                color={fee.isPaid ? "success" : "warning"}
                sx={{ minWidth: 90, justifyContent: "center" }}
              >
                {fee.isPaid ? "Paid" : "Not paid"}
              </Chip>
              <Typography level="body-sm" textColor="text.secondary">
                {fee.isPaid ? "Receipt available" : "Payment required"}
              </Typography>
            </Stack>
          </Card>
        </Stack>

        <Typography level="title-sm" sx={{ mb: 1 }}>
          Fee items
        </Typography>

        <Table
          borderAxis="xBetween"
          size="sm"
          aria-label="fee items"
          sx={{
            "--TableCell-paddingX": "0.75rem",
            "--TableCell-paddingY": "0.5rem",
            borderRadius: "sm",
            overflow: "hidden",
            "& thead th": {
              fontWeight: "md",
              backgroundColor: "var(--joy-palette-neutral-50)",
              borderBottom: "1px solid var(--joy-palette-neutral-200)",
            },
          }}
        >
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: "center" }}>Qty</th>
              <th style={{ textAlign: "right" }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(fee.items) ? fee.items : []).map((item, idx) => (
              <tr key={idx}>
                <th scope="row">{item?.name ?? "—"}</th>
                <td style={{ textAlign: "center" }}>{item?.quantity ?? "—"}</td>
                <td style={{ textAlign: "right" }}>
                  {Number(item?.price ?? 0).toLocaleString("en-NG")}
                </td>
              </tr>
            ))}
            <tr>
              <th scope="row" colSpan={2}>
                Total
              </th>
              <td style={{ textAlign: "right", fontWeight: 600 }}>
                {Number(fee.amount ?? 0).toLocaleString("en-NG")}
              </td>
            </tr>
          </tbody>
        </Table>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
          <Button variant="plain" color="neutral" onClick={onClose}>
            Close
          </Button>
          {fee.isPaid ? (
            <Button
              startDecorator={<ReceiptIcon />}
              variant="solid"
              color="neutral"
              onClick={onReceipt}
              disabled={!((fee?.userPayment ?? fee?.studentPayment)?._id)}
            >
              Receipt
            </Button>
          ) : (
            <Button
              startDecorator={<PaymentIcon />}
              variant="solid"
              color="primary"
              onClick={onPay}
              loading={isPaying}
            >
              Pay
            </Button>
          )}
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

function FeeCard({ fee, onOpen }) {
  const due = formatDate(fee?.dueDate);
  const paid = Boolean(fee?.isPaid);

  return (
    <Card
      variant="outlined"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      sx={{
        cursor: "pointer",
        borderRadius: "lg",
        transition: "transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease",
        outline: "none",
        bgcolor: paid ? "success.softBg" : "background.surface",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "md",
          borderColor: paid ? "success.outlinedBorder" : "primary.outlinedBorder",
        },
        "&:focus-visible": {
          boxShadow: "0 0 0 3px var(--joy-palette-primary-softBg)",
          borderColor: "primary.outlinedBorder",
        },
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography level="title-md" sx={{ fontWeight: 700 }} noWrap>
              {fee?.name ?? "Fee"}
            </Typography>
            <Typography level="body-sm" textColor="text.secondary" sx={{ mt: 0.25 }}>
              Due {due}
            </Typography>
          </Box>
          <Chip
            variant="soft"
            size="sm"
            color={paid ? "success" : "warning"}
            sx={{ minWidth: 92, justifyContent: "center" }}
          >
            {paid ? "Paid" : "Not paid"}
          </Chip>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography level="body-xs" textColor="text.secondary">
              Amount
            </Typography>
            <Typography level="title-lg" sx={{ fontWeight: 800 }}>
              {formatNaira(fee?.amount)}
            </Typography>
          </Box>
          <Typography level="body-sm" textColor="text.secondary">
            Click to view details
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

const getFees = async () => {
  const response = await fetchService.get("/api/v1/student/me/fees");
  if (!response.ok) {
    throw new Error(response.message);
  }
  return response.data;
};
const createPayment = async (data) => {
  const response = await fetchService.post("/api/v1/payment/initialize", data);
  if (!response.ok) {
    throw new Error(response.message);
  }
  return response.data;
};
export default function Payment() {
  const { token } = useAuthStore();
  const [activeFee, setActiveFee] = React.useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["fees"],
    queryFn: getFees,
  });

  const { mutate, isPending } = useMutation({
    queryKey: ["payment"],
    mutationFn: createPayment,
    onSuccess: (res) => {
      const { ok, data, message } = res;
      if (ok) {
        window.location.href = data.authorizationUrl;
      }
    },
  });

  const handleActionClick = (feeId) => {
    mutate({ fee: feeId });
  };

  const fees = Array.isArray(data?.data) ? data.data : [];

  const receiptUrl =
    (activeFee?.userPayment?._id ?? activeFee?.studentPayment?._id) && token
      ? `${configs.baseUrl}/api/v1/payment/receipt/${activeFee.userPayment?._id ?? activeFee.studentPayment._id}?token=${token}`
      : null;

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: "lg",
        boxShadow: "sm",
        maxWidth: "1100px",
        mx: "auto",
      }}
    >
      <Stack spacing={0.75} sx={{ mb: 2 }}>
        <Typography level="h4" sx={{ fontWeight: 800 }}>
          Fees
        </Typography>
        <Typography level="body-sm" textColor="text.secondary">
          View fee details, make payments, and download receipts.
        </Typography>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size="md" />
        </Box>
      ) : error ? (
        <Alert color="danger" variant="soft" sx={{ mb: 2 }}>
          {error.message || "An error occurred while fetching your fee information"}
        </Alert>
      ) : fees.length === 0 ? (
        <Card variant="soft" color="neutral" sx={{ textAlign: "center", py: 6, borderRadius: "lg" }}>
          <Typography level="title-md" sx={{ fontWeight: 700 }}>
            No fees available
          </Typography>
          <Typography level="body-sm" textColor="text.secondary" sx={{ mt: 0.5 }}>
            If you believe this is a mistake, please contact the finance department.
          </Typography>
        </Card>
      ) : (
        <Box
          role="list"
          aria-label="Fees list"
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
            gap: { xs: 1.25, sm: 1.5 },
          }}
        >
          {fees.map((fee) => (
            <Box key={fee?._id} role="listitem">
              <FeeCard fee={fee} onOpen={() => setActiveFee(fee)} />
            </Box>
          ))}
        </Box>
      )}

      {fees.length > 0 && (
        <Card variant="soft" color="neutral" sx={{ mt: 2, p: 1.75, borderRadius: "lg" }}>
          <Typography level="body-xs" textColor="text.secondary">
            Pay your fees on time to avoid late payment penalties. For payment issues, contact the finance department.
          </Typography>
        </Card>
      )}

      <FeeDetailsModal
        open={Boolean(activeFee)}
        fee={activeFee}
        isPaying={isPending}
        onClose={() => setActiveFee(null)}
        onPay={() => {
          if (!activeFee?._id) return;
          handleActionClick(activeFee._id);
        }}
        onReceipt={() => {
          if (!receiptUrl) return;
          window.location.href = receiptUrl;
        }}
      />
    </Card>
  );
}
