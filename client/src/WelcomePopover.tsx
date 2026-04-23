// Welcome popover is currently disabled on startup.

import React from "react";
import {
  Popover,
  Box,
  Typography,
  Chip,
  Card,
  CardHeader,
  IconButton,
  CardContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  APP_DISPLAY_NAME,
  APP_FULL_NAME,
  colorPalette,
} from "@/utils/constants";
import LoginButton from "@/gui/map/toolbar/Login";

interface WelcomePopoverProps {
  open: boolean;
  onClose: () => void;
}

const closeButtonStyle = {
  bottom: 5.5,
};

const cardStyle = {
  backgroundColor: colorPalette.lightGray,
};

const cardHeaderStyle = {
  backgroundColor: colorPalette.white,
  color: "var(--fs-text)",
  height: "24px",
};

const WelcomePopover: React.FC<WelcomePopoverProps> = ({ open, onClose }) => {
  const anchorPosition = {
    top: window.innerHeight / 2,
    left: window.innerWidth / 2,
  };

  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
      transformOrigin={{ vertical: "center", horizontal: "center" }}
      slotProps={{
        paper: { sx: { width: 750, maxWidth: "90vw", p: 0 } },
      }}
    >
      <Card sx={cardStyle}>
        <CardHeader
          sx={cardHeaderStyle}
          action={
            <IconButton
              type="button"
              sx={closeButtonStyle}
              onClick={onClose}
              aria-label="close"
            >
              <CloseIcon color="error" />
            </IconButton>
          }
        />
        <CardContent sx={{ display: "flex", minHeight: 300 }}>
          {/* LEFT SIDE */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              borderRight: 1,
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h5" gutterBottom>
              {APP_DISPLAY_NAME} 시작
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              {APP_FULL_NAME}
            </Typography>
            <Typography gutterBottom>
              바로 시작을 누르거나 이 창을 닫으면 바로 편집할 수 있습니다.
              로그인하면 저장과 추가 지도 기능을 함께 쓸 수 있습니다.
            </Typography>
            <Typography gutterBottom>
              {APP_DISPLAY_NAME}는 ArmyAicenter가 만든 도구입니다. 민감한 정보나
              기밀은 입력하지 마세요.
            </Typography>
          </Box>

          {/* RIGHT SIDE */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Chip
              key={"build-scenario"}
              label={"바로 시작"}
              clickable
              variant="outlined"
              sx={{ alignSelf: "stretch", py: 1 }}
              onClick={onClose}
            />
            <LoginButton />
            <Typography variant="body2">
              로그인하면 저장 기능과 추가 지도를 사용할 수 있습니다.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Popover>
  );
};

export default WelcomePopover;
