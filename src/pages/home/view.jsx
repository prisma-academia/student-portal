import * as React from "react";
import "./fc.css";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Stack from "@mui/joy/Stack";

import Memos from "./components/Memos";
import MemoContent from "./components/MemoContent";
import EventContent from "./components/EventContent";

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { Divider } from "@mui/joy";
import { useAuthStore } from "../../store";
import { useQuery } from "@tanstack/react-query";
import fetchService from "../../component/fetch";

export default function EmailExample() {
  const [openMemo, setOpenMemo] = React.useState(false);
  const [memo, setMemo] = React.useState(null);
  const [event, setEvent] = React.useState(null);
  const { user } = useAuthStore();
  const getEvents = async () => {
    try {
      const response = await fetchService.get("/api/v1/student/me/events");
      if (!response.ok) {
        throw new Error(response.message);
      }
      return response.data.data;
    } catch (error) {
      return error.message;
    }
  };
  const { data, isLoading, error } = useQuery({
    queryKey: ["event"],
    queryFn: getEvents,
  });

  React.useEffect(() => {
    try {
      let calendarEl = document.getElementById("calendar");
      let calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
        initialView: "listYear",
        editable: true,
        aspectRatio: 2.5,
        headerToolbar: {
          left: "prev,next",
          right: "listWeek,dayGridMonth",
        },
        events: data,
        eventClick: function (info) {
          info.jsEvent.preventDefault();
          setEvent(info.event);
        },
      });
      calendar.render();
    } catch (error) {
      console.log({ error });
    }
  }, [data]);

  return (
    <Box>
      <EventContent event={event} setEvent={setEvent} />
      <Typography
        sx={{ m: 2 }}
        level="title-lg"
        textColor="var(--joy-palette-success-plainColor)"
      >
        {`${user?.personalInfo?.firstName} ${user?.personalInfo?.lastName}  (${user.regNumber})`}
      </Typography>
      <Divider />
      <Stack
        mt={3}
        gap={2}
        direction={{ xs: "column-reverse", sm: "column-reverse", md: "row" }}
        width="100%"
      >
        <Divider />
        <Box flex={2}>
          <Typography
            mb={1}
            level="title-lg"
            color="neutral"
            textAlign="center"
          >
            Memos
          </Typography>
          {openMemo ? (
            <MemoContent setOpenMemo={setOpenMemo} memo={memo} />
          ) : (
            <Memos setOpenMemo={setOpenMemo} setMemo={setMemo} />
          )}
        </Box>
        <Divider orientation="vertical" />
        <Box flex={3}>
          <Typography
            mb={1}
            level="title-lg"
            color="neutral"
            textAlign="center"
          >
            Calendar
          </Typography>
          <Box p={1} component="div" id="calendar" />
        </Box>
      </Stack>
    </Box>
  );
}
