import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import type { LiveCommentaryNotification } from "@/gui/map/toolbar/liveCommentary";

interface LiveCommentaryNotificationsProps {
  notifications: LiveCommentaryNotification[];
  onDismiss: (id: string) => void;
}

const toneAccentMap = {
  success: "#2f6a3a",
  warning: "#9b5d18",
  info: "#305f8f",
} as const;

export default function LiveCommentaryNotifications({
  notifications,
  onDismiss,
}: Readonly<LiveCommentaryNotificationsProps>) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: { xs: 12, md: 20 },
        right: { xs: 12, md: 20 },
        zIndex: 1350,
        width: { xs: "calc(100vw - 24px)", sm: 360 },
        maxWidth: "calc(100vw - 24px)",
        pointerEvents: "none",
      }}
    >
      <Stack spacing={1.1}>
        {notifications.map((notification) => {
          const accentColor = toneAccentMap[notification.tone];

          return (
            <Paper
              key={notification.id}
              elevation={6}
              sx={{
                p: 1.4,
                borderRadius: 2.5,
                backgroundColor: "rgba(249, 246, 236, 0.96)",
                border: `1px solid ${accentColor}`,
                boxShadow: "0 16px 38px rgba(0, 0, 0, 0.16)",
                pointerEvents: "auto",
                backdropFilter: "blur(10px)",
              }}
            >
              <Stack spacing={0.75}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Stack direction="row" spacing={0.8} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        px: 0.9,
                        py: 0.3,
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 800,
                        color: notification.sideColor,
                        backgroundColor: "rgba(255, 255, 255, 0.72)",
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        flexShrink: 0,
                      }}
                    >
                      {notification.sideName}
                    </Box>
                    <Typography
                      sx={{
                        pt: 0.45,
                        fontSize: 11,
                        color: "text.secondary",
                      }}
                    >
                      {notification.occurredAtLabel}
                    </Typography>
                  </Stack>
                  <IconButton
                    size="small"
                    onClick={() => onDismiss(notification.id)}
                    sx={{ mt: -0.3, mr: -0.4 }}
                    aria-label="close-live-commentary"
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>

                <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.4 }}>
                  {notification.headline}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: "text.secondary",
                  }}
                >
                  {notification.commentary}
                </Typography>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
