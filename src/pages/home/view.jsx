import * as React from "react";
import "./fc.css";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";
import Card from "@mui/joy/Card";
import Divider from "@mui/joy/Divider";

import Memos from "./components/Memos";
import MemoContent from "./components/MemoContent";
import EventContent from "./components/EventContent";

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

import { useAuthStore } from "../../store";
import { useQuery } from "@tanstack/react-query";
import fetchService from "../../component/fetch";

export default function Home() {
  const [openMemo, setOpenMemo] = React.useState(false);
  const [memo, setMemo] = React.useState(null);
  const [event, setEvent] = React.useState(null);
  const calendarRef = React.useRef(null);
  const { user } = useAuthStore();

  const getEvents = async () => {
    const response = await fetchService.get("/api/v1/student/me/events");
    if (!response.ok) throw new Error(response.message);
    return response.data?.data ?? [];
  };

  const { data } = useQuery({
    queryKey: ["event"],
    queryFn: getEvents,
  });

  React.useEffect(() => {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;

    if (calendarRef.current) {
      calendarRef.current.destroy();
      calendarRef.current = null;
    }

    const calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
      initialView: "listWeek",
      handleWindowResize: true,
      height: "auto",
      headerToolbar: {
        left: "prev,next",
        center: "title",
        right: "listWeek,dayGridMonth",
      },
      events: Array.isArray(data) ? data : [],
      eventClick: (info) => {
        info.jsEvent.preventDefault();
        setEvent(info.event);
      },
    });

    calendar.render();
    calendarRef.current = calendar;

    return () => {
      calendar.destroy();
      calendarRef.current = null;
    };
  }, [data]);

  const firstName = user?.personalInfo?.firstName ?? "";
  const lastName = user?.personalInfo?.lastName ?? "";

  return (
    <Box sx={{ width: "100%" }}>
      <EventContent event={event} setEvent={setEvent} />

      {/* Greeting */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography level="h4" fontWeight={800}>
          Welcome back, {firstName || "Student"}
        </Typography>
        <Typography level="body-sm" textColor="text.secondary">
          {user?.regNumber} — {user?.program?.name ?? ""}
        </Typography>
      </Box>

      <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

      {/* Two-pane layout */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        gap={{ xs: 2, md: 3 }}
        alignItems="flex-start"
        sx={{ width: "100%" }}
      >
        {/* Calendar — shows first on both mobile and desktop */}
        <Box sx={{ flex: { xs: "1 1 auto", md: 3 }, minWidth: 0, width: "100%" }}>
          <Typography
            level="title-sm"
            fontWeight={700}
            textColor="text.secondary"
            sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}
          >
            Schedule
          </Typography>
          <Card variant="outlined" sx={{ p: { xs: 1, sm: 1.5 }, borderRadius: "xl", overflow: "hidden" }}>
            <Box component="div" id="calendar" sx={{ width: "100%", minWidth: 0 }} />
          </Card>
        </Box>

        <Divider
          orientation="vertical"
          sx={{ display: { xs: "none", md: "block" }, alignSelf: "stretch" }}
        />
        <Divider sx={{ display: { xs: "block", md: "none" } }} />

        {/* Memos — shows second on mobile, right column on desktop */}
        <Box sx={{ flex: { xs: "1 1 auto", md: 2 }, minWidth: 0, width: "100%" }}>
          <Typography
            level="title-sm"
            fontWeight={700}
            textColor="text.secondary"
            sx={{ mb: 1.5, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.7rem" }}
          >
            Memos
          </Typography>
          <Card variant="outlined" sx={{ borderRadius: "xl", overflow: "hidden", p: 0 }}>
            {openMemo ? (
              <MemoContent setOpenMemo={setOpenMemo} memo={memo} />
            ) : (
              <Memos setOpenMemo={setOpenMemo} setMemo={setMemo} />
            )}
          </Card>
        </Box>
      </Stack>
    </Box>
  );
}
