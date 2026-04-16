import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

const TIMEOUT_MS = 30000;

export default function HealthCheck() {
  const env = import.meta.env.VITE_ENV;
  const apiUrl = import.meta.env.VITE_API_SERVER_URL;

  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!env || env === "standalone") return;
    let active = true;
    setStatus("checking");

    const timer = setTimeout(() => {
      if (active) setStatus("down");
    }, TIMEOUT_MS);

    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (!active) return;
        clearTimeout(timer);
        setStatus(res.ok ? "connected" : "down");
      })
      .catch(() => {
        if (!active) return;
        clearTimeout(timer);
        setStatus("down");
      });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [apiUrl]);

  const statusTone =
    !env || env === "standalone"
      ? { label: "로컬 실행 중", color: "#86fff2" }
      : status === "checking"
        ? { label: "서버 확인 중", color: "#f0bb6d" }
        : status === "connected"
          ? { label: "서버 연결 완료", color: "#63efb4" }
          : { label: "서버 연결 안 됨", color: "#ff948b" };

  let content;
  if (!env || env === "standalone") {
    content = (
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {statusTone.label}
      </Typography>
    );
  } else if (status === "checking") {
    content = (
      <Stack direction="row" alignItems="center" gap={1}>
        <CircularProgress size={15} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {statusTone.label}
        </Typography>
      </Stack>
    );
  } else {
    content = (
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {statusTone.label}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        px: 1.1,
        py: 0.7,
        borderRadius: 999,
        border: "1px solid rgba(45, 214, 196, 0.18)",
        backgroundColor: "rgba(255,255,255,0.04)",
        color: statusTone.color,
      }}
    >
      {content}
    </Box>
  );
}
