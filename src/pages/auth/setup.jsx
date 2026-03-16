import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
  IconButton,
  Avatar,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { useAuthStore, useSnackStore } from "../../store";
import fetchService from "../../component/fetch";
import { useMutation } from "@tanstack/react-query";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate } from "react-router-dom";

function SetupScreen() {
  const { setAlert } = useSnackStore();
  const logIn = useAuthStore((state) => state.logIn);
  const navigate = useNavigate();
  const { state } = useLocation();
  const student = state?.student;

  const [selectedFile, setSelectedFile] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [dateOfBirth, setDateOfBirth] = useState("");

  useEffect(() => {
    if (!student) {
      setAlert({ message: "Session expired. Please sign in again.", variant: "danger" });
      navigate("/auth/sign-in", { replace: true });
    }
  }, [student, navigate, setAlert]);

  const postData = async (payload) => {
    const { useFormData, formData, jsonBody } = payload;
    const endpoint = "/api/v1/student/setup";
    const response = useFormData
      ? await fetchService.postPublicFormData(endpoint, formData)
      : await fetchService.postPublic(endpoint, jsonBody);
    if (!response.ok) {
      throw new Error(response.message);
    }
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: postData,
    onSuccess: (data) => {
      const payload = data.data || {};
      setAlert({ message: "Setup completed successfully", variant: "success" });
      logIn({ user: payload.student, token: payload.token, refreshToken: payload.refreshToken });
      navigate("/", { replace: true });
    },
    onError: (error) => {
      setAlert({ message: error.message, variant: "danger" });
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleDeleteImage = () => setSelectedFile(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!student) return;
    const email = student.email?.trim();
    const regNumber = student.regNumber?.trim();
    if (!email && !regNumber) {
      setAlert({ message: "Student email or registration number is missing.", variant: "danger" });
      return;
    }
    if (!passwords.currentPassword || !passwords.newPassword) {
      setAlert({ message: "Current password and new password are required.", variant: "danger" });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setAlert({ message: "Passwords do not match.", variant: "danger" });
      return;
    }
    if (!dateOfBirth) {
      setAlert({ message: "Date of birth is required.", variant: "danger" });
      return;
    }

    const jsonBody = {
      ...(email && { email }),
      ...(regNumber && { regNumber }),
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword,
      dateOfBirth,
    };

    if (selectedFile) {
      const formData = new FormData();
      if (email) formData.append("email", email);
      if (regNumber) formData.append("regNumber", regNumber);
      formData.append("currentPassword", passwords.currentPassword);
      formData.append("newPassword", passwords.newPassword);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("picture", selectedFile);
      mutation.mutate({ useFormData: true, formData });
    } else {
      mutation.mutate({ useFormData: false, jsonBody });
    }
  };

  if (!student) return null;

  return (
    <div>
      <Stack gap={4} sx={{ mb: 2 }}>
        <Typography component="h1" level="h3">
          Complete Setup
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack gap={4} sx={{ mt: 2 }}>
          <FormControl>
            <FormLabel>Profile Picture (optional)</FormLabel>
            <Box
              sx={{
                width: 150,
                height: 150,
                border: "2px dashed #ccc",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {!selectedFile ? (
                <IconButton component="label" color="primary" sx={{ position: "absolute", zIndex: 1 }}>
                  <AddPhotoAlternateIcon />
                  <input type="file" name="picture" onChange={handleFileChange} accept="image/*" hidden />
                </IconButton>
              ) : (
                <>
                  <Avatar
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected profile"
                    sx={{ width: "100%", height: "100%" }}
                  />
                  <IconButton color="danger" onClick={handleDeleteImage} sx={{ position: "absolute", top: 8, right: 8 }}>
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </FormControl>
          <Typography>
            <Typography fontWeight={700}>Full Name: </Typography>
            {`${student.personalInfo?.firstName || ""} ${student.personalInfo?.lastName || ""} ${student.personalInfo?.middleName || ""}`.trim() || "—"}
          </Typography>

          <FormControl required>
            <FormLabel>Current password (from welcome email)</FormLabel>
            <Input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              required
            />
          </FormControl>
          <FormControl required>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              required
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Date of birth</FormLabel>
            <Input
              type="date"
              name="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </FormControl>

          <Button type="submit" fullWidth disabled={mutation.isLoading}>
            {mutation.isLoading ? "Submitting..." : "Complete Setup"}
          </Button>
        </Stack>
      </form>
    </div>
  );
}

export default SetupScreen;
