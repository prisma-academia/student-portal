import * as React from "react";
import PropTypes from "prop-types";
import IconButton from "@mui/joy/IconButton";
import Table from "@mui/joy/Table";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import Chip from "@mui/joy/Chip";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import { useMutation, useQuery } from "@tanstack/react-query";
import fetchService from "../../../component/fetch";
import millify from "millify";
import { useAuthStore } from "../../../store";
import configs from "../../../configs";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Divider from "@mui/joy/Divider";
import Button from "@mui/joy/Button";
import CircularProgress from "@mui/joy/CircularProgress";
import Alert from "@mui/joy/Alert";

function Row(props) {
  const { row, onActionClick } = props;
  const [open, setOpen] = React.useState(props.initialOpen || false);
  const {token} = useAuthStore()

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Active":
        return "success";
      case "Overdue":
        return "danger";
      default:
        return "neutral";
    }
  };
console.log({row})
  return (
    <React.Fragment>
      <tr className={row.isPaid ? "paid-row" : "unpaid-row"}>
        <td>
          <IconButton
            aria-label="expand row"
            variant="plain"
            color="neutral"
            size="sm"
            onClick={() => setOpen(!open)}
            sx={{ 
              borderRadius: '50%',
              transition: 'all 0.2s',
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </td>
        <th scope="row">
          <Typography>{row.name}</Typography>
        </th>
        <td>
          <Typography>
            ₦{millify(row.amount, {
              precision: 2,
              locales: "ng-NG",
            })}
          </Typography>
        </td>
        <td>
          <Typography>
            {new Date(row.dueDate).toLocaleDateString('en-NG', {
              year: 'numeric',
              month: 'short', 
              day: 'numeric'
            })}
          </Typography>
        </td>
        <td>
          <Chip
            variant="soft"
            size="sm"
            color={row.isPaid ? "success" : "warning"}
            sx={{ 
              minWidth: '70px',
              justifyContent: 'center' 
            }}
          >
            {row.isPaid ? "Paid" : "Not Paid"}
          </Chip>
        </td>
        <td>
          {row.isPaid ? (
            <Button
              startDecorator={<ReceiptIcon />}
              variant="outlined"
              size="sm"
              color="neutral"
              onClick={() => {
                window.location.href = `${configs.baseUrl}/api/v1/payment/receipt/${row.userPayment._id}?token=${token}`
              }}
            >
              Receipt
            </Button>
          ) : (
            <Button
              startDecorator={<PaymentIcon />}
              variant="soft"
              size="sm"
              color="primary"
              onClick={() => {
                onActionClick(row._id);
              }}
            >
              Pay Now
            </Button>
          )}
        </td>
      </tr>
      <tr>
        <td style={{ height: 0, padding: 0 }} colSpan={6}>
          {open && (
            <Card
              variant="outlined"
              sx={{
                p: 2,
                m: 1,
                borderRadius: 'sm',
                boxShadow: 'xs',
              }}
            >
              <Typography 
                level="title-sm" 
                component="div"
                textAlign="center"
                sx={{ mb: 1.5 }}
              >
                {row.name} Details
              </Typography>
              <Divider sx={{ my: 1 }} />
              
              <Typography level="body-sm" component="div" sx={{ mb: 1 }}>
                Fee Items
              </Typography>
              
              <Table
                borderAxis="xBetween"
                size="sm"
                aria-label="fee items"
                sx={{
                  '--TableCell-paddingX': '0.75rem',
                  '--TableCell-paddingY': '0.5rem',
                  '& thead th': {
                    fontWeight: 'medium',
                    borderBottom: '1px solid var(--joy-palette-neutral-200)',
                  }
                }}
              >
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Price (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {row.items.map((item, index) => (
                    <tr key={index}>
                      <th scope="row">{item.name}</th>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{item.price.toLocaleString('en-NG')}</td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" colSpan={2}>Total</th>
                    <td style={{ textAlign: 'right', fontWeight: 'medium' }}>
                      {row.amount.toLocaleString('en-NG')}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          )}
        </td>
      </tr>
    </React.Fragment>
  );
}

Row.propTypes = {
  initialOpen: PropTypes.bool,
  row: PropTypes.shape({
    name: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    dueDate: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    isPaid: PropTypes.bool.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onActionClick: PropTypes.func.isRequired,
};

const rows = [
  {
    _id: "1",
    name: "Tuition Fee",
    amount: 50000,
    dueDate: "2024-12-01",
    status: "Active", // Color-coded based on status
    isPaid: false,
    items: [
      { name: "Books", quantity: 1, price: 5000 },
      { name: "Lab Equipment", quantity: 2, price: 20000 },
    ],
  },
  {
    _id: "1",
    name: "Tuition Fee",
    amount: 50000,
    dueDate: "2024-12-01",
    status: "Active", // Color-coded based on status
    isPaid: false,
    items: [
      { name: "Books", quantity: 1, price: 5000 },
      { name: "Lab Equipment", quantity: 2, price: 20000 },
    ],
  },
  {
    _id: "1",
    name: "Tuition Fee",
    amount: 50000,
    dueDate: "2024-12-01",
    status: "Active", // Color-coded based on status
    isPaid: false,
    items: [
      { name: "Books", quantity: 1, price: 5000 },
      { name: "Lab Equipment", quantity: 2, price: 20000 },
    ],
  },
];
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

  return (
    <Card
      variant="outlined"
      sx={{
        p: { xs: 1, md: 2 },
        borderRadius: 'md',
        boxShadow: 'sm',
        maxWidth: '1200px',
        mx: 'auto'
      }}
    >
      <Typography level="h5" sx={{ mb: 2 }}>
        Payment Management
      </Typography>
      
      <Typography level="body-sm" sx={{ mb: 3, color: 'text.secondary' }}>
        View your fees, make payments, and download receipts
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size="md" />
        </Box>
      ) : error ? (
        <Alert color="danger" sx={{ mb: 2 }}>
          {error.message || "An error occurred while fetching your payment information"}
        </Alert>
      ) : data?.data?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography level="body-md">No payment information available</Typography>
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table
            aria-label="fees table"
            sx={{
              '--TableCell-paddingX': { xs: '0.5rem', md: '0.75rem' },
              '--TableCell-paddingY': { xs: '0.5rem', md: '0.75rem' },
              borderRadius: 'sm',
              overflow: 'hidden',
              '& th:not(:first-of-type)': {  // Apply background to all headers EXCEPT the first one
                backgroundColor: 'var(--joy-palette-neutral-50)',
                fontWeight: 'medium',
              },
              '& thead tr': {
                borderBottom: '1px solid var(--joy-palette-neutral-200)',
              },
              '& tbody tr:hover': {
                backgroundColor: 'var(--joy-palette-neutral-50)',
              },
              '& .paid-row': {
                backgroundColor: 'var(--joy-palette-success-50)',
                opacity: 0.9,
              },
              '& .unpaid-row': {
                backgroundColor: 'white',
              },
            }}
          >
            <thead>
              <tr>
                <th style={{ width: 48 }} aria-label="expand" />
                <th>Fee Name</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map((row, index) => (
                <Row
                  key={row._id}
                  row={row}
                  onActionClick={handleActionClick}
                />
              ))}
            </tbody>
          </Table>
        </Box>
      )}
      
      {data?.data?.length > 0 && (
        <Box sx={{ mt: 3, p: 1.5, borderRadius: 'sm', bgcolor: 'neutral.50' }}>
          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
            Pay your fees on time to avoid late payment penalties. For any payment issues, please contact the finance department.
          </Typography>
        </Box>
      )}
    </Card>
  );
}
