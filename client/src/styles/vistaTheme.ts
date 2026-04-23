import { alpha, createTheme } from "@mui/material/styles";

const palette = {
  background: "#02090d",
  surface: "#06161d",
  surfaceStrong: "#0b2128",
  card: "#102731",
  border: "#13454f",
  borderStrong: "#2dd6c4",
  text: "#ddfffa",
  textSoft: "#84aca9",
  accent: "#35d9c6",
  accentStrong: "#1fb7a7",
  accentSoft: "#86fff2",
  sand: "#f0bb6d",
  accentContrast: "#031114",
};

const vistaTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: palette.accent,
      dark: palette.accentStrong,
      light: palette.accentSoft,
      contrastText: palette.accentContrast,
    },
    secondary: {
      main: palette.sand,
      dark: "#ba8842",
      light: "#ffd59d",
      contrastText: palette.accentContrast,
    },
    background: {
      default: palette.background,
      paper: palette.card,
    },
    text: {
      primary: palette.text,
      secondary: palette.textSoft,
    },
    divider: palette.border,
    success: {
      main: "#4cd67a",
    },
    warning: {
      main: "#ffbe63",
    },
    error: {
      main: "#ff7c74",
    },
  },
  typography: {
    fontFamily: '"Bahnschrift", "Malgun Gothic", "Noto Sans KR", sans-serif',
    h5: {
      fontWeight: 700,
      letterSpacing: "0.04em",
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "0.03em",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.03em",
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--fs-bg": palette.background,
          "--fs-surface": palette.surface,
          "--fs-surface-strong": palette.surfaceStrong,
          "--fs-card": palette.card,
          "--fs-border": palette.border,
          "--fs-border-strong": palette.borderStrong,
          "--fs-text": palette.text,
          "--fs-text-soft": palette.textSoft,
          "--fs-accent": palette.accent,
          "--fs-accent-strong": palette.accentStrong,
          "--fs-accent-soft": palette.accentSoft,
          "--fs-sand": palette.sand,
          "--fs-overlay": "rgba(3, 12, 16, 0.72)",
          "--fs-glow": "rgba(53, 217, 198, 0.22)",
        },
        "html, body, #root": {
          height: "100%",
        },
        "*": {
          boxSizing: "border-box",
        },
        body: {
          margin: 0,
          color: palette.text,
          background: `
            radial-gradient(circle at 16% 12%, ${alpha(palette.accent, 0.18)} 0%, transparent 26%),
            radial-gradient(circle at 88% 16%, ${alpha("#1c5e68", 0.18)} 0%, transparent 24%),
            linear-gradient(180deg, #041017 0%, #02090d 52%, #010508 100%)`,
          fontFamily:
            '"Bahnschrift", "Malgun Gothic", "Noto Sans KR", sans-serif',
          position: "relative",
        },
        "body::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: `
            linear-gradient(180deg, transparent 0%, ${alpha("#000000", 0.16)} 100%),
            repeating-linear-gradient(
              0deg,
              ${alpha(palette.accentSoft, 0.03)} 0,
              ${alpha(palette.accentSoft, 0.03)} 1px,
              transparent 1px,
              transparent 4px
            )
          `,
          opacity: 0.8,
        },
        "body::after": {
          content: '""',
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          boxShadow: `inset 0 0 120px ${alpha("#000000", 0.7)}`,
        },
        "::selection": {
          backgroundColor: alpha(palette.accent, 0.3),
          color: palette.accentContrast,
        },
        ".App": {
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        },
        "button, input, textarea": {
          font: "inherit",
        },
        "::-webkit-scrollbar": {
          width: 10,
          height: 10,
        },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(palette.accent, 0.42),
          borderRadius: 999,
        },
        "::-webkit-scrollbar-track": {
          backgroundColor: alpha(palette.surfaceStrong, 0.65),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(palette.surface, 0.78),
          backdropFilter: "blur(18px)",
          color: palette.text,
          boxShadow: "none",
          borderBottom: `1px solid ${alpha(palette.borderStrong, 0.28)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: alpha(palette.card, 0.92),
          border: `1px solid ${alpha(palette.borderStrong, 0.22)}`,
          boxShadow: `0 20px 44px ${alpha("#000000", 0.4)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(palette.surfaceStrong, 0.95),
          border: `1px solid ${alpha(palette.borderStrong, 0.2)}`,
          boxShadow: `0 18px 42px ${alpha("#000000", 0.36)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(180deg, ${alpha(palette.surfaceStrong, 0.96)} 0%, ${alpha(palette.surface, 0.98)} 100%)`,
          backdropFilter: "blur(18px)",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 14,
        },
        contained: {
          backgroundColor: palette.accent,
          color: palette.accentContrast,
          boxShadow: `0 0 0 1px ${alpha(palette.accentSoft, 0.12)}, 0 10px 24px ${alpha(palette.accent, 0.16)}`,
          "&.Mui-disabled": {
            backgroundColor: alpha(palette.surfaceStrong, 0.88),
            color: alpha(palette.textSoft, 0.55),
            border: `1px solid ${alpha(palette.borderStrong, 0.12)}`,
          },
          "&:hover": {
            backgroundColor: palette.accentStrong,
          },
        },
        outlined: {
          borderColor: alpha(palette.accent, 0.45),
          color: palette.text,
          backgroundColor: alpha(palette.surfaceStrong, 0.5),
          "&:hover": {
            borderColor: palette.accent,
            backgroundColor: alpha(palette.accent, 0.12),
          },
          "&.Mui-disabled": {
            borderColor: alpha(palette.borderStrong, 0.1),
            color: alpha(palette.textSoft, 0.45),
            backgroundColor: alpha(palette.surface, 0.45),
          },
        },
        text: {
          color: palette.accentSoft,
          "&:hover": {
            backgroundColor: alpha(palette.accent, 0.08),
          },
          "&.Mui-disabled": {
            color: alpha(palette.textSoft, 0.4),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          letterSpacing: "0.03em",
        },
        outlined: {
          backgroundColor: alpha(palette.surfaceStrong, 0.7),
          borderColor: alpha(palette.borderStrong, 0.24),
        },
        filled: {
          backgroundColor: palette.accent,
          color: palette.accentContrast,
        },
        colorDefault: {
          backgroundColor: alpha(palette.surfaceStrong, 0.85),
          color: palette.text,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: palette.text,
          "&:hover": {
            backgroundColor: alpha(palette.accent, 0.12),
          },
          "&.Mui-disabled": {
            color: alpha(palette.textSoft, 0.38),
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: palette.accent,
        },
        rail: {
          backgroundColor: alpha(palette.textSoft, 0.24),
        },
        track: {
          border: "none",
          boxShadow: `0 0 14px ${alpha(palette.accent, 0.3)}`,
        },
        thumb: {
          boxShadow: `0 0 0 4px ${alpha(palette.accent, 0.18)}`,
        },
        valueLabel: {
          backgroundColor: alpha(palette.card, 0.98),
          color: palette.text,
          border: `1px solid ${alpha(palette.borderStrong, 0.22)}`,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          backdropFilter: "blur(16px)",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: alpha(palette.card, 0.96),
          color: palette.text,
          border: `1px solid ${alpha(palette.borderStrong, 0.24)}`,
          borderRadius: 6,
          fontSize: "0.75rem",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(palette.surface, 0.92),
          borderRadius: 10,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(palette.accent, 0.5),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: palette.accent,
            borderWidth: 1,
          },
        },
        notchedOutline: {
          borderColor: alpha(palette.borderStrong, 0.18),
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: alpha(palette.accent, 0.12),
          },
          "&.Mui-selected:hover, &:hover": {
            backgroundColor: alpha(palette.accent, 0.18),
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha(palette.borderStrong, 0.18),
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default vistaTheme;
