import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Link,
  Stack,
  Typography,
} from "@mui/joy";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackStore, useAuthStore } from "../../store";
import fetchService from "../../component/fetch";
import { useMutation } from "@tanstack/react-query";
import RouterLink from "../../component/router-link";

function ChangePassword() {
  const { setAlert } = useSnackStore();
  const logIn = useAuthStore((state) => state.logIn);
  const navigate = useNavigate();
  const { state } = useLocation();
  const student = state?.student;
  const existingToken = state?.token;
  const existingRefreshToken = state?.refreshToken;

  const [email, setEmail] = useState(student?.email ?? "");
  const [regNumber, setRegNumber] = useState(student?.regNumber ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const postData = async (payload) => {
    const response = await fetchService.postPublic("/api/v1/student/change-password", payload);
    if (!response.ok) {
      throw new Error(response.message);
    }
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: postData,
    onSuccess: () => {
      setAlert({ message: "Password changed successfully", variant: "success" });
      if (existingToken && student) {
        logIn({ user: student, token: existingToken, refreshToken: existingRefreshToken ?? null });
      }
      navigate("/", { replace: true });
    },
    onError: (error) => {
      setAlert({ message: error.message, variant: "danger" });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const e = email?.trim();
    const r = regNumber?.trim();
    if (!e && !r) {
      setAlert({ message: "Enter email or registration number", variant: "danger" });
      return;
    }
    if (!currentPassword || !newPassword) {
      setAlert({ message: "Current and new password are required", variant: "danger" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert({ message: "New passwords do not match", variant: "danger" });
      return;
    }
    mutation.mutate({
      ...(e && { email: e }),
      ...(r && { regNumber: r }),
      currentPassword,
      newPassword,
    });
  };

  return (
    <div>
      <Stack gap={4} sx={{ mb: 2 }}>
        <Typography component="h1" level="h3">
          Change Password
        </Typography>
        <Typography level="body2">
          Enter your email or registration number and passwords to change your password.
        </Typography>
      </Stack>
      <Stack gap={4} sx={{ mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Or use registration number below"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Registration Number</FormLabel>
            <Input
              type="text"
              name="regNumber"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="Or use email above"
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Current Password</FormLabel>
            <Input
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </FormControl>
          <FormControl required>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Confirm New Password</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </FormControl>
          <Stack gap={4} sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link component={RouterLink} level="title-sm" href="/auth/sign-in">
                Back to Login
              </Link>
            </Box>
            <Button type="submit" fullWidth disabled={mutation.isLoading}>
              {mutation.isLoading ? "Changing..." : "Change Password"}
            </Button>
          </Stack>
        </form>
      </Stack>
    </div>
  );
}

export default ChangePassword;
