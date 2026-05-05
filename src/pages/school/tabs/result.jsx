import { useMemo } from "react";
import { Chip, Typography, Box, Card, Stack, Divider } from "@mui/joy";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DownloadIcon from "@mui/icons-material/Download";
import SchoolIcon from "@mui/icons-material/School";
import CustomTable from "../../../component/table";
import { useAuthStore } from "../../../store";
import configs from "../../../configs";

export default function Result() {
  const { token, user } = useAuthStore();

  const academicYears = useMemo(() => {
    if (!user?.classLevel || !user?.program) return [];
    const currentLevel = parseInt(user.classLevel.level) || 100;
    const programDuration = parseInt(user.program.durationInYears) || 4;
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - (Math.floor(currentLevel / 100) - 1);

    const years = [];
    for (let i = 1; i <= programDuration; i++) {
      const level = i * 100;
      const yearStart = startYear + (i - 1);
      const yearEnd = yearStart + 1;
      const academicYear = `${yearStart}/${yearEnd}`;

      let status = "Upcoming";
      let firstSemester = "Upcoming";
      let secondSemester = "Upcoming";

      if (level < currentLevel) {
        status = "Completed";
        firstSemester = "Available";
        secondSemester = "Available";
      } else if (level === currentLevel) {
        status = "Active";
        firstSemester = "Available";
        secondSemester = "Unavailable";
      }

      years.push({
        id: level.toString(),
        class: `${level} Level`,
        status,
        firstSemester,
        secondSemester,
        year: academicYear,
      });
    }
    return years;
  }, [user]);

  const handleDownloadResult = (semester, yearId) => {
    localStorage.setItem("lastSelectedResultYear", yearId);
    window.location.href = `${configs.baseUrl}/api/v1/student/results?token=${token}&semester=${semester}&yearId=${yearId}`;
  };

  const columns = [
    {
      columnLabel: "Academic Year",
      accessorKey: "year",
      width: { xs: 80, sm: 100 },
      renderCell: (row) => (
        <Stack direction="column" spacing={0.5}>
          <Typography level="body-sm" fontWeight="bold">
            {row.year}
          </Typography>
          <Typography level="body-xs" color="neutral">
            {row.class}
          </Typography>
        </Stack>
      ),
    },
    {
      columnLabel: "Status",
      accessorKey: "status",
      width: { xs: 70, sm: 80 },
      renderCell: (row) => (
        <Chip
          size="sm"
          color={
            row.status === "Active"
              ? "success"
              : row.status === "Upcoming"
              ? "warning"
              : "neutral"
          }
          variant={row.status === "Active" ? "solid" : "soft"}
          startDecorator={row.status === "Active" ? <SchoolIcon /> : null}
        >
          {row.status}
        </Chip>
      ),
    },
    {
      columnLabel: "First Semester",
      accessorKey: "firstSemester",
      width: { xs: 110, sm: 140 },
      renderCell: (row) => (
        <Chip
          startDecorator={<ReceiptIcon />}
          variant="outlined"
          size="sm"
          sx={{
            px: { xs: 0.5, sm: 1 },
            minWidth: { xs: 90, sm: 110 },
            cursor: row.firstSemester === "Available" ? "pointer" : "not-allowed",
            opacity: row.firstSemester === "Available" ? 1 : 0.6,
          }}
          color={row.firstSemester === "Available" ? "primary" : "neutral"}
          onClick={() => {
            if (row.firstSemester === "Available") {
              handleDownloadResult("First Semester", row.id);
            }
          }}
        >
          {row.firstSemester === "Available" ? "Download" : "Unavailable"}
        </Chip>
      ),
    },
    {
      columnLabel: "Second Semester",
      accessorKey: "secondSemester",
      width: { xs: 110, sm: 140 },
      renderCell: (row) => (
        <Chip
          startDecorator={<ReceiptIcon />}
          variant="outlined"
          size="sm"
          sx={{
            px: { xs: 0.5, sm: 1 },
            minWidth: { xs: 90, sm: 110 },
            cursor: row.secondSemester === "Available" ? "pointer" : "not-allowed",
            opacity: row.secondSemester === "Available" ? 1 : 0.6,
          }}
          color={row.secondSemester === "Available" ? "primary" : "neutral"}
          onClick={() => {
            if (row.secondSemester === "Available") {
              handleDownloadResult("Second Semester", row.id);
            }
          }}
        >
          {row.secondSemester === "Available" ? "Download" : "Unavailable"}
        </Chip>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Card variant="outlined" sx={{ mb: 2, p: { xs: 2, sm: 3 }, borderRadius: "lg" }}>
        <Typography
          level="h4"
          sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: "1.25rem", sm: "1.5rem" }, fontWeight: 800 }}
        >
          Semester Results
        </Typography>
        {user?.program && (
          <Typography level="body-sm" textColor="text.secondary" sx={{ mb: { xs: 1, sm: 2 } }}>
            Program: {user.program.name} ({user.program.durationInYears} years)
          </Typography>
        )}
        <Divider />
        <Box sx={{ mt: { xs: 1, sm: 2 }, overflow: "auto" }}>
          {academicYears.length === 0 ? (
            <Card variant="soft" color="neutral" sx={{ textAlign: "center", py: 6, borderRadius: "lg" }}>
              <Typography level="title-md">No academic data available</Typography>
              <Typography level="body-sm" textColor="text.secondary" sx={{ mt: 0.5 }}>
                Contact the registrar if this is unexpected.
              </Typography>
            </Card>
          ) : (
            <CustomTable
              columns={columns}
              rows={academicYears}
              sx={{
                minWidth: "100%",
                "& .MuiTableCell-root": {
                  padding: { xs: "8px 4px", sm: "16px 8px" },
                },
              }}
            />
          )}
        </Box>
      </Card>
    </Box>
  );
}
