import { useState, type MouseEvent } from "react";
import { Box, IconButton, Popover, Stack, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { RL_LAB_PALETTE } from "@/gui/rl/rlLabPalette";

interface RlLabInfoButtonProps {
  content: string;
  title?: string;
  label?: string;
  tone?: "light" | "dark";
}

export default function RlLabInfoButton(
  props: Readonly<RlLabInfoButtonProps>
) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label={props.label ?? "설명 보기"}
        onClick={handleOpen}
        sx={{
          width: 28,
          height: 28,
          border: `1px solid ${
            props.tone === "dark"
              ? "rgba(248, 250, 252, 0.22)"
              : RL_LAB_PALETTE.surfaceBorder
          }`,
          color:
            props.tone === "dark"
              ? "rgba(248, 250, 252, 0.88)"
              : RL_LAB_PALETTE.mutedText,
          backgroundColor:
            props.tone === "dark"
              ? "rgba(248, 250, 252, 0.08)"
              : RL_LAB_PALETTE.surfaceRaised,
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            p: 1.5,
            maxWidth: 320,
            borderRadius: 2.5,
            border: `1px solid ${RL_LAB_PALETTE.surfaceStrongBorder}`,
            backgroundColor: RL_LAB_PALETTE.surfaceRaisedStrong,
            color: RL_LAB_PALETTE.text,
            boxShadow: RL_LAB_PALETTE.shadow,
          },
        }}
      >
        <Stack spacing={0.75}>
          {props.title && (
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {props.title}
            </Typography>
          )}
          <Box sx={{ whiteSpace: "pre-line" }}>
            <Typography variant="body2" sx={{ color: RL_LAB_PALETTE.text }}>
              {props.content}
            </Typography>
          </Box>
        </Stack>
      </Popover>
    </>
  );
}
