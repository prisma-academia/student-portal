import * as React from "react";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import Chip from "@mui/joy/Chip";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
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
import Alert from "@mui/joy/Alert";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";

function formatNaira(amount) {
  const num = typeof amount === "number" ? amount : Number(amount ?? 0);
  return `₦${millify(num, { precision: 2, locales: "ng-NG" })}`;
}

function formatNairaFull(amount) {
  const num = typeof amount === "number" ? amount : Number(amount ?? 0);
  return `₦${num.toLocaleString("en-NG")}`;
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}

function isOverdue(dateString) {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

function SkeletonCard() {
  return (
    <Box
      sx={{
        height: 140,
        borderRadius: "xl",
        bgcolor: "background.level2",
        animation: "pulse 1.5s ease-in-out infinite",
        "@keyframes pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
      }}
    />
  );
}

function StatTile({ icon, label, value, color }) {
  return (
    <Card variant="soft" color={color ?? "neutral"} sx={{ flex: 1, minWidth: 0, p: { xs: 1.5, sm: 2 }, borderRadius: "xl" }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "lg",
            bgcolor: `${color ?? "neutral"}.softBg`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: `${color ?? "neutral"}.500`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="body-xs" textColor="text.secondary" noWrap>
            {label}
          </Typography>
          <Typography level="title-md" fontWeight={800} noWrap>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

function FeeDetailsModal({ open, fee, onClose, onPay, onReceipt, isPaying }) {
  if (!fee) return null;
  const overdue = !fee.isPaid && isOverdue(fee.dueDate);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="fee-details-title"
        variant="outlined"
        sx={{
          width: { xs: "calc(100vw - 24px)", sm: 680 },
          maxWidth: "680px",
          p: 0,
          borderRadius: "xl",
          boxShadow: "xl",
          overflow: "hidden",
          maxHeight: "calc(100vh - 48px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal header */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <ModalClose sx={{ "--IconButton-size": "32px", top: 12, right: 12 }} />
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ pr: 4 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "lg",
                bgcolor: fee.isPaid ? "success.softBg" : overdue ? "danger.softBg" : "primary.softBg",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: fee.isPaid ? "success.500" : overdue ? "danger.500" : "primary.500",
                flexShrink: 0,
              }}
            >
              {fee.isPaid ? (
                <CheckCircleOutlineRoundedIcon />
              ) : overdue ? (
                <WarningAmberRoundedIcon />
              ) : (
                <AccountBalanceWalletRoundedIcon />
              )}
            </Box>
            <Box>
              <Typography id="fee-details-title" level="title-lg" fontWeight={800}>
                {fee.name}
              </Typography>
              <Chip
                size="sm"
                variant="soft"
                color={fee.isPaid ? "success" : overdue ? "danger" : "warning"}
                sx={{ mt: 0.25 }}
              >
                {fee.isPaid ? "Paid" : overdue ? "Overdue" : "Not paid"}
              </Chip>
            </Box>
          </Stack>
        </Box>

        {/* Scrollable body */}
        <Box sx={{ overflow: "auto", p: { xs: 2.5, sm: 3 }, flexGrow: 1 }}>
          {/* Summary tiles */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ mb: 3 }}
          >
            <Card variant="outlined" sx={{ flex: 1, p: 2, borderRadius: "lg" }}>
              <Typography level="body-xs" textColor="text.secondary">
                Total amount
              </Typography>
              <Typography level="h4" fontWeight={800} sx={{ mt: 0.25 }}>
                {formatNaira(fee.amount)}
              </Typography>
            </Card>
            <Card variant="outlined" sx={{ flex: 1, p: 2, borderRadius: "lg" }}>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 14, color: "text.tertiary" }} />
                <Typography level="body-xs" textColor="text.secondary">
                  Due date
                </Typography>
              </Stack>
              <Typography
                level="title-md"
                fontWeight={700}
                sx={{ color: overdue && !fee.isPaid ? "danger.500" : "text.primary" }}
              >
                {formatDate(fee.dueDate)}
              </Typography>
              {overdue && !fee.isPaid && (
                <Typography level="body-xs" color="danger" sx={{ mt: 0.25 }}>
                  Payment overdue
                </Typography>
              )}
            </Card>
          </Stack>

          {/* Fee items table */}
          {Array.isArray(fee.items) && fee.items.length > 0 && (
            <>
              <Typography level="title-sm" fontWeight={700} sx={{ mb: 1.5 }}>
                Fee breakdown
              </Typography>
              <Box
                sx={{
                  borderRadius: "lg",
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  mb: 2,
                }}
              >
                <Table
                  borderAxis="xBetween"
                  size="sm"
                  aria-label="fee items"
                  sx={{
                    "--TableCell-paddingX": "1rem",
                    "--TableCell-paddingY": "0.625rem",
                    "& thead th": {
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      bgcolor: "background.level1",
                      color: "text.secondary",
                    },
                    "& tbody tr:last-child td, & tbody tr:last-child th": {
                      borderBottom: "none",
                      fontWeight: 700,
                      bgcolor: "background.level1",
                    },
                  }}
                >
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style={{ textAlign: "center", width: 60 }}>Qty</th>
                      <th style={{ textAlign: "right" }}>Price (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fee.items.map((item, idx) => (
                      <tr key={idx}>
                        <th scope="row" style={{ fontWeight: 500 }}>
                          {item?.name ?? "—"}
                        </th>
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
                      <td style={{ textAlign: "right" }}>
                        {Number(fee.amount ?? 0).toLocaleString("en-NG")}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Box>
            </>
          )}
        </Box>

        {/* Fixed footer actions */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderTop: "1px solid",
            borderColor: "divider",
            flexShrink: 0,
            bgcolor: "background.surface",
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button variant="outlined" color="neutral" onClick={onClose}>
              Close
            </Button>
            {fee.isPaid ? (
              <Button
                startDecorator={<ReceiptIcon />}
                variant="solid"
                color="success"
                onClick={onReceipt}
                disabled={!((fee?.userPayment ?? fee?.studentPayment)?._id)}
              >
                Download Receipt
              </Button>
            ) : (
              <Button
                startDecorator={<PaymentIcon />}
                variant="solid"
                color={overdue ? "danger" : "primary"}
                onClick={onPay}
                loading={isPaying}
              >
                Pay Now
              </Button>
            )}
          </Stack>
        </Box>
      </ModalDialog>
    </Modal>
  );
}

function FeeCard({ fee, onOpen }) {
  const paid = Boolean(fee?.isPaid);
  const overdue = !paid && isOverdue(fee?.dueDate);

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
        borderRadius: "xl",
        transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
        outline: "none",
        height: "100%",
        borderLeft: "4px solid",
        borderLeftColor: paid
          ? "success.400"
          : overdue
          ? "danger.400"
          : "neutral.300",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "md",
          borderLeftColor: paid
            ? "success.500"
            : overdue
            ? "danger.500"
            : "primary.400",
        },
        "&:focus-visible": {
          boxShadow: "0 0 0 3px var(--joy-palette-primary-softBg)",
          borderLeftColor: "primary.500",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, height: "100%" }}>
        <Stack sx={{ height: "100%" }} spacing={1.5}>
          {/* Top row: name + status badge */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "md",
                  bgcolor: paid
                    ? "success.softBg"
                    : overdue
                    ? "danger.softBg"
                    : "primary.softBg",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: paid ? "success.500" : overdue ? "danger.500" : "primary.500",
                }}
              >
                {paid ? (
                  <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                ) : overdue ? (
                  <WarningAmberRoundedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <PendingActionsRoundedIcon sx={{ fontSize: 18 }} />
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography level="title-sm" fontWeight={700} noWrap>
                  {fee?.name ?? "Fee"}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CalendarTodayRoundedIcon sx={{ fontSize: 11, color: "text.tertiary" }} />
                  <Typography
                    level="body-xs"
                    sx={{ color: overdue ? "danger.500" : "text.secondary" }}
                  >
                    Due {formatDate(fee?.dueDate)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
            <Chip
              size="sm"
              variant="soft"
              color={paid ? "success" : overdue ? "danger" : "warning"}
              sx={{ flexShrink: 0 }}
            >
              {paid ? "Paid" : overdue ? "Overdue" : "Pending"}
            </Chip>
          </Stack>

          <Divider />

          {/* Amount + arrow */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography level="body-xs" textColor="text.secondary">
                Amount
              </Typography>
              <Typography level="title-lg" fontWeight={800}>
                {formatNaira(fee?.amount)}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "background.level2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

const getFees = async () => {
  const response = await fetchService.get("/api/v1/student/me/fees");
  if (!response.ok) throw new Error(response.message);
  return response.data;
};

const createPayment = async (data) => {
  const response = await fetchService.post("/api/v1/payment/initialize", data);
  if (!response.ok) throw new Error(response.message);
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
    mutationFn: createPayment,
    onSuccess: (res) => {
      if (res?.ok) {
        window.location.href = res.data.authorizationUrl;
      }
    },
  });

  const fees = Array.isArray(data?.data) ? data.data : [];

  const totalAmount = fees.reduce((sum, f) => sum + Number(f?.amount ?? 0), 0);
  const paidCount = fees.filter((f) => f?.isPaid).length;
  const pendingCount = fees.length - paidCount;

  const receiptUrl =
    (activeFee?.userPayment?._id ?? activeFee?.studentPayment?._id) && token
      ? `${configs.baseUrl}/api/v1/student/me/receipt/${
          activeFee.userPayment?._id ?? activeFee.studentPayment._id
        }?token=${token}`
      : null;

  return (
    <Stack spacing={2.5} sx={{ maxWidth: "1100px", mx: "auto" }}>
      {/* Page header */}
      <Box>
        <Typography level="h4" fontWeight={800}>
          Fees &amp; Payments
        </Typography>
        <Typography level="body-sm" textColor="text.secondary">
          View fee details, make payments, and download receipts.
        </Typography>
      </Box>

      {/* Summary stats — only when data is loaded */}
      {!isLoading && !error && fees.length > 0 && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <StatTile
            icon={<AccountBalanceWalletRoundedIcon />}
            label="Total fees"
            value={formatNaira(totalAmount)}
            color="primary"
          />
          <StatTile
            icon={<CheckCircleOutlineRoundedIcon />}
            label="Paid"
            value={`${paidCount} of ${fees.length}`}
            color="success"
          />
          <StatTile
            icon={<PendingActionsRoundedIcon />}
            label="Pending"
            value={`${pendingCount} fee${pendingCount !== 1 ? "s" : ""}`}
            color={pendingCount > 0 ? "warning" : "neutral"}
          />
        </Stack>
      )}

      {/* Fee list */}
      <Card
        variant="outlined"
        sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: "xl", boxShadow: "sm" }}
      >
        {isLoading ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 1.5,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </Box>
        ) : error ? (
          <Alert
            color="danger"
            variant="soft"
            startDecorator={<WarningAmberRoundedIcon />}
            sx={{ borderRadius: "lg" }}
          >
            {error.message || "Could not load your fee information. Please try again."}
          </Alert>
        ) : fees.length === 0 ? (
          <Stack alignItems="center" sx={{ py: 6, gap: 1 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "xl",
                bgcolor: "background.level2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.tertiary",
              }}
            >
              <AccountBalanceWalletRoundedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography level="title-md" fontWeight={700}>
              No fees available
            </Typography>
            <Typography level="body-sm" textColor="text.secondary" sx={{ textAlign: "center", maxWidth: 300 }}>
              If you believe this is a mistake, please contact the finance department.
            </Typography>
          </Stack>
        ) : (
          <Box
            role="list"
            aria-label="Fees list"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: { xs: 1.5, sm: 2 },
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
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: "lg",
              bgcolor: "background.level1",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography level="body-xs" textColor="text.secondary">
              Pay your fees on time to avoid late payment penalties. For payment issues, contact the finance department.
            </Typography>
          </Box>
        )}
      </Card>

      <FeeDetailsModal
        open={Boolean(activeFee)}
        fee={activeFee}
        isPaying={isPending}
        onClose={() => setActiveFee(null)}
        onPay={() => {
          if (!activeFee?._id) return;
          mutate({ fee: activeFee._id });
        }}
        onReceipt={() => {
          if (!receiptUrl) return;
          window.location.href = receiptUrl;
        }}
      />
    </Stack>
  );
}
