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
  import React from "react";
  import { useSnackStore } from "../../store";
  import fetchService from "../../component/fetch";
  import { useMutation } from "@tanstack/react-query";
import RouterLink from "../../component/router-link";
  
  function ForgotPassword() {
    const { setAlert } = useSnackStore();
  
    const postData = async (newData) => {
      const response = await fetchService.postPublic("/api/v1/student/forgot-password", newData);
      if (!response.ok) {
        throw new Error(response.message);
      }
      return response.message; // Assuming the API returns a success message
    };
  
    const mutation = useMutation({
      mutationFn: postData,
      onSuccess: (message) => {
        setAlert({ message, variant: "success" });
      },
      onError: (error) => {
        setAlert({ message: error.message, variant: "danger" });
      },
    });
  
    const handleSubmit = (event) => {
      event.preventDefault();
      const formElements = event.currentTarget.elements;
      const data = {
        email: formElements.email.value,
        regNumber: formElements.regNumber.value,
      };
      mutation.mutate(data);
    };
  
    return (
      <div>
        <Stack gap={4} sx={{ mb: 2 }}>
          <Stack gap={1}>
            <Typography component="h1" level="h3">
              Forgot Password
            </Typography>
            <Typography level="body2">
              Enter your email and registration number to reset your password.
            </Typography>
          </Stack>
        </Stack>
        <Stack gap={4} sx={{ mt: 2 }}>
          <form onSubmit={handleSubmit}>
            <FormControl required>
              <FormLabel>Email</FormLabel>
              <Input type="email" name="email" />
            </FormControl>
            <FormControl required>
              <FormLabel>Registration Number</FormLabel>
              <Input type="text" name="regNumber" />
            </FormControl>
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
                {mutation.isLoading ? "Submitting..." : "Submit"}
              </Button>
            </Stack>
          </form>
        </Stack>
      </div>
    );
  }
  
  export default ForgotPassword;
  