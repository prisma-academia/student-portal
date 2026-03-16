import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Link,
  Stack,
  Typography,
} from "@mui/joy";
import { useState } from "react";
import { useAuthStore, useSnackStore } from "../../store";
import fetchService from "../../component/fetch";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import RouterLink from "../../component/router-link";

function SignIn() {
  const logIn = useAuthStore((state) => state.logIn);
  const { setAlert } = useSnackStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const postData = async (newData) => {
    const response = await fetchService.postPublic("/api/v1/student/login", newData);
    if (!response.ok) {
      throw new Error(response.message);
    }
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: postData,
    onSuccess: (data) => {
      const payload = data.data || {};
      if (data.redirectTo) {
        navigate("/auth/setup", {
          state: { token: payload.token, student: payload.student, refreshToken: payload.refreshToken },
        });
      } else if (data.mustChangePassword) {
        navigate("/auth/change-password", {
          state: { student: payload.student, token: payload.token, refreshToken: payload.refreshToken },
        });
      } else {
        setAlert({ message: "Login successful", variant: "success" });
        logIn({ user: payload.student, token: payload.token, refreshToken: payload.refreshToken });
        navigate("/", { replace: true });
      }
    },
    onError: (error) => {
      setAlert({ message: error.message, variant: "danger" });
    },
  });

  const handleSubmit = (event) => {
    try {
      event.preventDefault();
      const formElements = event.currentTarget.elements;
      const loginId = formElements.loginId?.value?.trim();
      if (!loginId) {
        setAlert({ message: "Enter email or registration number", variant: "danger" });
        return;
      }
      const isEmail = loginId.includes("@");
      const data = {
        ...(isEmail ? { email: loginId } : { regNumber: loginId }),
        password: formElements.password.value,
        persistent: formElements.persistent?.checked,
      };
      mutation.mutate(data);
    } catch (error) {
      setAlert({ message: error.message, variant: "danger" });
    }
  };

  return (
    <div>
      <Stack gap={4} sx={{ mb: 2 }}>
        <Stack gap={1}>
          <Typography component="h1" level="h3">
            Sign in
          </Typography>
        </Stack>
      </Stack>
      <Stack gap={4} sx={{ mt: 2 }}>
        <form onSubmit={handleSubmit}>
          <FormControl required>
            <FormLabel>Email or Registration number</FormLabel>
            <Input type="text" name="loginId" placeholder="Email or registration number" autoComplete="username" />
          </FormControl>
          <FormControl required>
            <FormLabel>Password</FormLabel>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              endDecorator={
                <Button
                  size="sm"
                  variant="plain"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              }
            />
          </FormControl>
          <Stack gap={4} sx={{ mt: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Checkbox size="sm" label="Remember me" name="persistent" />
              <Link
                component={RouterLink}
                level="title-sm"
                href="/auth/forgot-password"
              >
                Forgot your password?
              </Link>
            </Box>
            <Button type="submit" fullWidth disabled={mutation.isLoading}>
              {mutation.isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </Stack>
        </form>
      </Stack>
    </div>
  );
}

export default SignIn;
