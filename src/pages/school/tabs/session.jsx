import { Chip, Typography, Box, Card, Stack, Divider } from "@mui/joy";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DownloadIcon from "@mui/icons-material/Download";
import SchoolIcon from "@mui/icons-material/School";
import CustomTable from "../../../component/table";
import { useAuthStore } from "../../../store";
import configs from "../../../configs";
import { useState, useEffect } from "react";

export default function Session() {
  const { token, user } = useAuthStore();
  const [classLevels, setClassLevels] = useState([]);

  useEffect(() => {
    if (user && user.classLevel && user.program) {
      const currentLevel = parseInt(user.classLevel.level) || 100;
      const programDuration = parseInt(user.program.durationInYears) || 4;
      
      // Generate class levels dynamically
      const levels = [];
      for (let i = 1; i <= programDuration; i++) {
        const level = i * 100;
        
        // Determine status based on current level
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
      
      setClassLevels(levels);
    }
  }, [user]);

  const handleDownloadForm = (semester, yearId) => {
    // Store the selected year in localStorage for tracking
    localStorage.setItem("lastSelectedAcademicYear", yearId);
    
    // Navigate to download URL
    window.location.href = `${configs.baseUrl}/api/v1/course/forms?token=${token}&semester=${semester}&yearId=${yearId}`;
  };

  const columns = [
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
      renderCell: (row) => (
        <Chip
          startDecorator={<DownloadIcon />}
          variant="outlined"
          size="sm"
          sx={{ 
            px: { xs: 0.5, sm: 1 },
            minWidth: { xs: 90, sm: 110 },
            cursor: "pointer" 
          }}
          color={row.firstSemester === "Ongoing" ? "primary" : "neutral"}
          onClick={() => handleDownloadForm("First Semester", row.id)}
        >
          Download Form
        </Chip>
      ),
    },
    {
      columnLabel: "Second Semester",
      accessorKey: "secondSemester",
      width: { xs: 110, sm: 140 },
      renderCell: (row) => (
        <Chip
          startDecorator={<DownloadIcon />}
          variant="outlined"
          size="sm"
          sx={{ 
            px: { xs: 0.5, sm: 1 },
            minWidth: { xs: 90, sm: 110 },
            cursor: "pointer",
            // opacity: row.secondSemester === "Upcoming" ? 0.7 : 1,
          }}
          color={row.secondSemester === "Ongoing" ? "primary" : "neutral"}
          onClick={() => handleDownloadForm("Second Semester", row.id)}
        >
          Download Form
        </Chip>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Card variant="outlined" sx={{ mb: 2, padding: { xs: 1, sm: 2 } }}>
        <Typography level="h4" sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          Academic Records
        </Typography>
        {user && user.program && (
          <Typography level="body-sm" sx={{ mb: { xs: 1, sm: 2 } }}>
            Program: {user.program.name} ({user.program.durationInYears} years)
          </Typography>
        )}
        <Divider />
        <Box sx={{ mt: { xs: 1, sm: 2 }, overflow: 'auto' }}>
          {classLevels.length > 0 ? (
            <CustomTable 
              columns={columns} 
              rows={classLevels}
              sx={{ 
                minWidth: { xs: '100%' },
                '& .MuiTableCell-root': {
                  padding: { xs: '8px 4px', sm: '16px 8px' }
                }
              }} 
            />
          ) : (
            <Typography level="body-sm" sx={{ p: 2, textAlign: 'center' }}>
              Loading academic data...
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
}
