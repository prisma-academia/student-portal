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
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackStore } from "../../store";
import fetchService from "../../component/fetch";
import { useMutation } from "@tanstack/react-query";
import RouterLink from "../../component/router-link";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { setAlert } = useSnackStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const token = searchParams.get("token");

  const postData = async (newData) => {
    const url = `/api/v1/student/reset-password?token=${encodeURIComponent(token)}`;
    const response = await fetchService.postPublic(url, newData);
    if (!response.ok) {
      throw new Error(response.message);
    }
    return response.data?.message || response.message;
  };

  const mutation = useMutation({
    mutationFn: postData,
    onSuccess: (message) => {
      setAlert({ message, variant: "success" });
      navigate("/auth/sign-in")
    },
    onError: (error) => {
      setAlert({ message: error.message, variant: "danger" });
    },
  });

  const handleSubmit = (event) => {
    try {
      event.preventDefault();
      if (!token) {
        setError("Reset link is invalid or expired. Please request a new one.");
        return;
      }
      if (password.length <= 5) {
        setError("Password must be longer than 5 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setError("");
      mutation.mutate({ password });
    } catch (error) {
      setAlert({ message: error.message, variant: "danger" });
    }
  };

  return (
    <div>
      <Stack gap={4} sx={{ mb: 2 }}>
        <Stack gap={1}>
          <Typography component="h1" level="h3">
            Reset Password
          </Typography>
          <Typography level="body2">
            Enter your new password and confirm it to reset your password.
          </Typography>
        </Stack>
      </Stack>
      <Stack gap={4} sx={{ mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <FormControl required>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
          </FormControl>
          {error && (
            <Typography color="danger" level="body-sm" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Stack gap={4} sx={{ mt: 2 }}>
          <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Link
                component={RouterLink}
                level="title-sm"
                href="/auth/sign-in"
              >
                Back to Login
              </Link>
            </Box>
            <Button type="submit" fullWidth disabled={mutation.isLoading}>
              {mutation.isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </Stack>
        </form>
      </Stack>
    </div>
  );
}

export default ResetPassword;
