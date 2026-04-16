import { useContext } from "react";
import { Box, Typography } from "@mui/material";
import { GameStatusContext } from "@/gui/contextProviders/contexts/GameStatusContext";

export default function CurrentActionContextDisplay() {
  const CurrentGameStatusFromContext = useContext(GameStatusContext);
  const statusText =
    CurrentGameStatusFromContext && CurrentGameStatusFromContext.trim().length
      ? CurrentGameStatusFromContext
      : "현재 실행 중인 작업이 없습니다.";

  return (
    <Box
      sx={{
        mx: 1,
        mt: 0.25,
        px: 1.2,
        py: 1,
        borderRadius: 2,
        background:
          "linear-gradient(180deg, rgba(9, 22, 28, 0.94) 0%, rgba(5, 14, 18, 0.96) 100%)",
        border: "1px solid rgba(45, 214, 196, 0.14)",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "var(--fs-accent-soft)",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        현재 상태
      </Typography>
      <Typography
        variant="body2"
        component="p"
        sx={{
          mt: 0.45,
          color: "var(--fs-text-soft)",
          fontSize: 12.5,
          lineHeight: 1.45,
        }}
      >
        {statusText}
      </Typography>
    </Box>
  );
}
