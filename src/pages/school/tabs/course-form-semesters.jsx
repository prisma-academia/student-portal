import * as React from "react";
import { Chip, Typography, Box, Card, Divider, CircularProgress, Alert } from "@mui/joy";
import DownloadIcon from "@mui/icons-material/Download";
import SchoolIcon from "@mui/icons-material/School";
import { useQuery } from "@tanstack/react-query";
import CustomTable from "../../../component/table";
import { useAuthStore } from "../../../store";
import configs from "../../../configs";
import fetchService from "../../../component/fetch";

const FIRST = "First Semester";
const SECOND = "Second Semester";

const getCourseFormSummary = async () => {
  const response = await fetchService.get("/api/v1/student/me/course-form-summary");
  if (!response.ok) {
    throw new Error(response.message);
  }
  return response.data;
};

function buildClassRows(user) {
  if (!user?.classLevel || !user?.program) return [];
  const currentLevel = parseInt(user.classLevel.level, 10) || 100;
  const programDuration = parseInt(user.program.durationInYears, 10) || 4;
  const levels = [];
  for (let i = 1; i <= programDuration; i++) {
    const level = i * 100;
    let status = "Upcoming";
    let firstSemester = "Upcoming";
    let secondSemester = "Upcoming";
    if (level < currentLevel) {
      status = "Past";
      firstSemester = "Completed";
      secondSemester = "Completed";
    } else if (level === currentLevel) {
      status = "Current";
      firstSemester = "Ongoing";
      secondSemester = "Upcoming";
    }
    levels.push({
      id: level.toString(),
      class: level,
      status,
      firstSemester,
      secondSemester,
    });
  }
  return levels;
}

export default function CourseFormSemesters() {
  const { token, user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["course-form-summary"],
    queryFn: getCourseFormSummary,
    enabled: Boolean(user?.program && user?.classLevel),
  });

  const availabilityByKey = React.useMemo(() => {
    const items = data?.data?.items ?? [];
    const m = new Map();
    for (const it of items) {
      m.set(`${it.yearId}:${it.semester}`, it);
    }
    return m;
  }, [data]);

  const classLevels = React.useMemo(() => buildClassRows(user), [user]);

  const openCourseFormPdf = React.useCallback(
    (semester, yearId) => {
      if (!token) return;
      localStorage.setItem("lastSelectedAcademicYear", yearId);
      const url = `${configs.baseUrl}/api/v1/student/me/course-form?token=${encodeURIComponent(token)}&semester=${encodeURIComponent(semester)}&yearId=${encodeURIComponent(yearId)}`;
      window.location.href = url;
    },
    [token]
  );

  const renderSemesterCell = React.useCallback(
    (row, semester) => {
      const key = `${row.id}:${semester}`;
      const entry = availabilityByKey.get(key);
      const available = Boolean(entry?.available);
      if (!available) {
        return (
          <Typography level="body-sm" textColor="text.secondary">
            —
          </Typography>
        );
      }
      return (
        <Chip
          startDecorator={<DownloadIcon />}
          variant="outlined"
          size="sm"
          role="button"
          tabIndex={0}
          onClick={() => openCourseFormPdf(semester, row.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openCourseFormPdf(semester, row.id);
            }
          }}
          sx={{
            px: { xs: 0.5, sm: 1 },
            minWidth: { xs: 90, sm: 110 },
            cursor: "pointer",
          }}
          color="primary"
        >
          Download
        </Chip>
      );
    },
    [availabilityByKey, openCourseFormPdf]
  );

  const columns = React.useMemo(
    () => [
      {
        columnLabel: "Class",
        accessorKey: "class",
        width: { xs: 80, sm: 100 },
        renderCell: (row) => (
          <Typography level="body-sm" fontWeight="bold">
            {row.class}
          </Typography>
        ),
      },
      {
        columnLabel: "Status",
        accessorKey: "status",
        width: { xs: 70, sm: 80 },
        renderCell: (row) => (
          <Chip
            size="sm"
            color={row.status === "Current" ? "success" : row.status === "Upcoming" ? "warning" : "neutral"}
            variant={row.status === "Current" ? "solid" : "soft"}
            startDecorator={row.status === "Current" ? <SchoolIcon /> : null}
          >
            {row.status}
          </Chip>
        ),
      },
      {
        columnLabel: "First Semester",
        accessorKey: "firstSemester",
        width: { xs: 110, sm: 140 },
        renderCell: (row) => renderSemesterCell(row, FIRST),
      },
      {
        columnLabel: "Second Semester",
        accessorKey: "secondSemester",
        width: { xs: 110, sm: 140 },
        renderCell: (row) => renderSemesterCell(row, SECOND),
      },
    ],
    [renderSemesterCell]
  );

  if (!user?.program || !user?.classLevel) {
    return (
      <Card variant="outlined" sx={{ mb: 2, padding: { xs: 1, sm: 2 } }}>
        <Typography level="title-md" sx={{ fontWeight: 700 }}>
          Course forms
        </Typography>
        <Typography level="body-sm" textColor="text.secondary" sx={{ mt: 1 }}>
          Program or class information is not available for your account.
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ mb: 2, padding: { xs: 1, sm: 2 } }}>
      <Typography level="h4" sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
        Course forms
      </Typography>
      <Typography level="body-sm" textColor="text.secondary" sx={{ mb: { xs: 1, sm: 2 } }}>
        Download official course forms by class level and semester when courses are available for your program.
      </Typography>
      <Divider />
      <Box sx={{ mt: { xs: 1, sm: 2 }, overflow: "auto" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size="md" />
          </Box>
        ) : error ? (
          <Alert color="danger" variant="soft" sx={{ my: 1 }}>
            {error.message || "Could not load course form availability"}
          </Alert>
        ) : classLevels.length > 0 ? (
          <CustomTable
            columns={columns}
            rows={classLevels}
            sx={{
              minWidth: "100%",
              "& .MuiTableCell-root": {
                padding: { xs: "8px 4px", sm: "16px 8px" },
              },
            }}
          />
        ) : (
          <Typography level="body-sm" sx={{ p: 2, textAlign: "center" }}>
            No class levels to display.
          </Typography>
        )}
      </Box>
    </Card>
  );
}
