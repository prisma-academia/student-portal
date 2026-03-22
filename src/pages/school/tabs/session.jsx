import { Typography, Box, Card } from "@mui/joy";
import { useAuthStore } from "../../../store";
import CourseFormSemesters from "./course-form-semesters";

export default function Session() {
  const { user } = useAuthStore();

  return (
    <Box sx={{ width: "100%" }}>
      {user?.program && (
        <Card variant="outlined" sx={{ mb: 2, padding: { xs: 1, sm: 2 } }}>
          <Typography level="h4" sx={{ mb: { xs: 0.5, sm: 1 }, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
            Academic overview
          </Typography>
          <Typography level="body-sm" textColor="text.secondary">
            Program: {user.program.name} ({user.program.durationInYears} years)
          </Typography>
        </Card>
      )}
      <CourseFormSemesters />
    </Box>
  );
}
