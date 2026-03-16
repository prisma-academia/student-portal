import {
  AspectRatio,
  Box,
  Button,
  Card,
  CardActions,
  CardOverflow,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/joy";
import { useState, useEffect } from "react";
import { useAuthStore, useSnackStore } from "../../store";
import fetchService from "../../component/fetch";
import configs from "../../configs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function Profile() {
  const { logIn } = useAuthStore();
  const { setAlert } = useSnackStore();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    personalInfo: { firstName: "", lastName: "", middleName: "", dateOfBirth: "" },
    contactInfo: { phone: "", email: "", address: "" },
  });

  const getProfile = async () => {
    const response = await fetchService.get("/api/v1/student/me");
    if (!response.ok) throw new Error(response.message);
    return response.data?.data ?? response.data;
  };

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: getProfile,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        personalInfo: {
          firstName: profile.personalInfo?.firstName ?? "",
          lastName: profile.personalInfo?.lastName ?? "",
          middleName: profile.personalInfo?.middleName ?? "",
          dateOfBirth: profile.personalInfo?.dateOfBirth
            ? new Date(profile.personalInfo.dateOfBirth).toISOString().slice(0, 10)
            : "",
        },
        contactInfo: {
          phone: profile.contactInfo?.phone ?? "",
          email: profile.email ?? profile.contactInfo?.email ?? "",
          address: profile.contactInfo?.address ?? "",
        },
      });
    }
  }, [profile]);

  const patchProfile = async (payload) => {
    const response = await fetchService.patch("/api/v1/student/me", payload);
    if (!response.ok) throw new Error(response.message);
    return response.data?.data ?? response.data;
  };

  const mutation = useMutation({
    mutationFn: patchProfile,
    onSuccess: (updated) => {
      setAlert({ message: "Profile updated", variant: "success" });
      queryClient.setQueryData(["profile", "me"], updated);
      if (updated && logIn) {
        const token = useAuthStore.getState().token;
        const refreshToken = useAuthStore.getState().refreshToken;
        if (token) logIn({ user: updated, token, refreshToken });
      }
    },
    onError: (err) => setAlert({ message: err.message, variant: "danger" }),
  });

  const handleSave = () => {
    mutation.mutate({
      personalInfo: form.personalInfo,
      contactInfo: form.contactInfo,
    });
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        personalInfo: {
          firstName: profile.personalInfo?.firstName ?? "",
          lastName: profile.personalInfo?.lastName ?? "",
          middleName: profile.personalInfo?.middleName ?? "",
          dateOfBirth: profile.personalInfo?.dateOfBirth
            ? new Date(profile.personalInfo.dateOfBirth).toISOString().slice(0, 10)
            : "",
        },
        contactInfo: {
          phone: profile.contactInfo?.phone ?? "",
          email: profile.email ?? profile.contactInfo?.email ?? "",
          address: profile.contactInfo?.address ?? "",
        },
      });
    }
  };

  const pictureUrl = profile?.picture ? `${configs.baseUrl}${profile.picture}` : null;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Alert color="danger" sx={{ m: 2 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Stack p={1} gap={2} justifyContent="space-around" direction={{ md: "row", xs: "column" }}>
      <Card sx={{ maxWidth: 500 }}>
        <Box>
          <Typography level="title-md">Personal info</Typography>
          <Typography level="body-sm">
            Customize how your profile information will appear to the networks.
          </Typography>
        </Box>
        <Divider />
        <Stack direction="column" spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <AspectRatio
              ratio="1"
              maxHeight={108}
              sx={{ flex: 0, minWidth: 108, borderRadius: "100%", overflow: "hidden" }}
            >
              <img
                src={pictureUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"}
                alt="Profile"
                loading="lazy"
              />
            </AspectRatio>
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
              <FormLabel>Name</FormLabel>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Input
                  size="sm"
                  placeholder="First name"
                  value={form.personalInfo.firstName}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      personalInfo: { ...f.personalInfo, firstName: e.target.value },
                    }))
                  }
                />
                <Input
                  size="sm"
                  placeholder="Last name"
                  value={form.personalInfo.lastName}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      personalInfo: { ...f.personalInfo, lastName: e.target.value },
                    }))
                  }
                />
              </Stack>
              <Input
                size="sm"
                placeholder="Middle name"
                value={form.personalInfo.middleName}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    personalInfo: { ...f.personalInfo, middleName: e.target.value },
                  }))
                }
              />
            </Stack>
          </Box>
          <FormControl>
            <FormLabel>Date of birth</FormLabel>
            <Input
              type="date"
              size="sm"
              value={form.personalInfo.dateOfBirth}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  personalInfo: { ...f.personalInfo, dateOfBirth: e.target.value },
                }))
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input
              size="sm"
              value={form.contactInfo.phone}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contactInfo: { ...f.contactInfo, phone: e.target.value },
                }))
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              size="sm"
              type="email"
              value={form.contactInfo.email}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contactInfo: { ...f.contactInfo, email: e.target.value },
                }))
              }
            />
          </FormControl>
          <FormControl sx={{ display: { sm: "contents" } }}>
            <FormLabel>Address</FormLabel>
            <Input
              size="sm"
              value={form.contactInfo.address}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  contactInfo: { ...f.contactInfo, address: e.target.value },
                }))
              }
            />
          </FormControl>
        </Stack>
        <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
            <Button size="sm" variant="outlined" color="neutral" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" variant="solid" onClick={handleSave} loading={mutation.isPending}>
              Save
            </Button>
          </CardActions>
        </CardOverflow>
      </Card>
    </Stack>
  );
}

export default Profile;
