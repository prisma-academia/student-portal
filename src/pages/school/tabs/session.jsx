import { Typography, Box, Card, Divider, Stack } from "@mui/joy";
import SchoolIcon from "@mui/icons-material/School";
import { useAuthStore } from "../../../store";
import CourseFormSemesters from "./course-form-semesters";

function InfoTile({ label, value, color }) {
  return (
    <Card variant="soft" color={color ?? "neutral"} sx={{ p: 1.5, borderRadius: "md" }}>
      <Typography level="body-xs" textColor="text.secondary">
        {label}
      </Typography>
      <Typography level="title-sm" sx={{ mt: 0.25, fontWeight: 700 }}>
        {value ?? "—"}
      </Typography>
    </Card>
  );
}

function formatEnrollmentDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { year: "numeric", month: "long" });
}

export default function Session() {
  const { user } = useAuthStore();

  return (
    <Box sx={{ width: "100%" }}>
      {user?.program && (
        <Card variant="outlined" sx={{ mb: 2, p: { xs: 2, sm: 3 }, borderRadius: "lg" }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <SchoolIcon sx={{ color: "primary.500", fontSize: 28 }} />
            <Typography level="h4" sx={{ fontWeight: 800 }}>
              Academic Overview
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            <InfoTile label="Program" value={user.program.name} />
            <InfoTile
              label="Duration"
              value={`${user.program.durationInYears} years`}
            />
            <InfoTile
              label="Current Level"
              value={user.classLevel ? `${user.classLevel.level} Level` : "—"}
              color={user.classLevel ? "success" : "neutral"}
            />
            <InfoTile label="Reg Number" value={user.regNumber} />
            <InfoTile
              label="Enrolled"
              value={formatEnrollmentDate(user.enrollmentDate)}
            />
          </Box>
        </Card>
      )}
      <CourseFormSemesters />
    </Box>
  );
}
