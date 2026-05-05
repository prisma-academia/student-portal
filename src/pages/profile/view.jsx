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
  Alert,
} from "@mui/joy";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { useState, useEffect } from "react";
import { useAuthStore, useSnackStore } from "../../store";
import fetchService from "../../component/fetch";
import configs from "../../configs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function ReadOnlyRow({ icon, label, value }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "sm",
          bgcolor: "background.level2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "primary.500",
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography level="body-xs" textColor="text.secondary">
          {label}
        </Typography>
        <Typography level="body-sm" fontWeight={700} noWrap>
          {value ?? "—"}
        </Typography>
      </Box>
    </Stack>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
}

function ProfileSkeleton() {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={3}
      sx={{ p: { xs: 0, sm: 1 } }}
    >
      {[{ w: { xs: "100%", md: 300 }, h: 460 }, { w: "100%", h: 460 }].map((dim, i) => (
        <Box
          key={i}
          sx={{
            width: dim.w,
            height: dim.h,
            borderRadius: "lg",
            bgcolor: "background.level2",
            animation: "pulse 1.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.4 },
            },
          }}
        />
      ))}
    </Stack>
  );
}

function Profile() {
  const { logIn, user: authUser } = useAuthStore();
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
      if (updated) {
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

  const pictureUrl = profile?.picture
    ? `${configs.baseUrl}${profile.picture}`
    : undefined;

  // Fall back to auth store for read-only academic fields if API doesn't return them
  const programName = profile?.program?.name ?? authUser?.program?.name;
  const classLevelValue = profile?.classLevel?.level ?? authUser?.classLevel?.level;
  const durationYears = profile?.program?.durationInYears ?? authUser?.program?.durationInYears;
  const enrollmentDate = profile?.enrollmentDate ?? authUser?.enrollmentDate;
  const regNumber = profile?.regNumber ?? authUser?.regNumber;
  const fullName =
    [
      profile?.personalInfo?.firstName ?? authUser?.personalInfo?.firstName,
      profile?.personalInfo?.lastName ?? authUser?.personalInfo?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Student";

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <Alert color="danger" variant="soft" sx={{ m: 2 }}>
        {error.message}
      </Alert>
    );
  }

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={3}
      alignItems={{ md: "flex-start" }}
    >
      {/* Hero card — profile picture + read-only academic info */}
      <Card
        variant="outlined"
        sx={{
          width: { xs: "100%", md: 300 },
          flexShrink: 0,
          borderRadius: "xl",
          overflow: "hidden",
        }}
      >
        {/* Picture */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 3,
            pb: 2,
            background: "linear-gradient(135deg, var(--joy-palette-primary-softBg) 0%, var(--joy-palette-background-surface) 100%)",
          }}
        >
          <AspectRatio
            ratio="1"
            sx={{
              width: 110,
              borderRadius: "50%",
              border: "3px solid",
              borderColor: "primary.outlinedBorder",
              boxShadow: "md",
              overflow: "hidden",
            }}
          >
            <img
              src={
                pictureUrl ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
              }
              alt="Profile"
              loading="lazy"
            />
          </AspectRatio>
        </Box>

        {/* Name + reg number */}
        <Box sx={{ textAlign: "center", px: 2, pb: 2 }}>
          <Typography level="title-lg" fontWeight={800}>
            {fullName}
          </Typography>
          {regNumber && (
            <Typography level="body-sm" textColor="text.secondary">
              {regNumber}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Academic info tiles */}
        <Stack spacing={2} sx={{ p: 2.5 }}>
          <Typography level="title-xs" textColor="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Academic Info
          </Typography>
          {programName && (
            <ReadOnlyRow
              icon={<SchoolRoundedIcon sx={{ fontSize: 16 }} />}
              label="Program"
              value={programName}
            />
          )}
          {classLevelValue && (
            <ReadOnlyRow
              icon={<BadgeRoundedIcon sx={{ fontSize: 16 }} />}
              label="Current Level"
              value={`${classLevelValue} Level`}
            />
          )}
          {durationYears && (
            <ReadOnlyRow
              icon={<AccessTimeRoundedIcon sx={{ fontSize: 16 }} />}
              label="Duration"
              value={`${durationYears} years`}
            />
          )}
          {enrollmentDate && (
            <ReadOnlyRow
              icon={<CalendarTodayRoundedIcon sx={{ fontSize: 16 }} />}
              label="Enrolled"
              value={formatDate(enrollmentDate)}
            />
          )}
        </Stack>
      </Card>

      {/* Edit forms card */}
      <Card
        variant="outlined"
        sx={{ flexGrow: 1, borderRadius: "xl" }}
      >
        <Box sx={{ mb: 1 }}>
          <Typography level="title-lg" fontWeight={800}>
            Personal info
          </Typography>
          <Typography level="body-sm" textColor="text.secondary">
            Update your name, date of birth, phone, and address.
          </Typography>
        </Box>
        <Divider />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            mt: 2,
          }}
        >
          <FormControl>
            <FormLabel>First name</FormLabel>
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
          </FormControl>
          <FormControl>
            <FormLabel>Last name</FormLabel>
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
          </FormControl>
          <FormControl sx={{ gridColumn: { sm: "1 / -1" } }}>
            <FormLabel>Middle name</FormLabel>
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
          </FormControl>
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
          <FormControl sx={{ gridColumn: { sm: "1 / -1" } }}>
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
          <FormControl sx={{ gridColumn: { sm: "1 / -1" } }}>
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
        </Box>

        <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider", mt: 2 }}>
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
