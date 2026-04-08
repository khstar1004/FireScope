import { alpha, createTheme } from "@mui/material/styles";

const palette = {
  background: "#d7ddc8",
  surface: "#e4e8d8",
  surfaceStrong: "#d2d9c0",
  card: "#f7f3ea",
  border: "#7f876c",
  text: "#1c2318",
  textSoft: "#4d5643",
  accent: "#5f7041",
  accentStrong: "#46552f",
  accentSoft: "#8e9971",
  sand: "#ad9669",
};

const fireScopeTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: palette.accent,
      dark: palette.accentStrong,
      light: palette.accentSoft,
      contrastText: palette.card,
    },
    secondary: {
      main: palette.sand,
      dark: "#89754d",
      light: "#c8b28c",
      contrastText: palette.text,
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
      main: "#627a3a",
    },
    warning: {
      main: "#b48a47",
    },
    error: {
      main: "#9a514b",
    },
  },
  typography: {
    fontFamily: '"Bahnschrift", "Malgun Gothic", "Noto Sans KR", sans-serif',
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 2,
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
          "--fs-text": palette.text,
          "--fs-text-soft": palette.textSoft,
          "--fs-accent": palette.accent,
          "--fs-accent-strong": palette.accentStrong,
          "--fs-sand": palette.sand,
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
            radial-gradient(circle at top left, ${alpha("#96a378", 0.36)} 0%, transparent 38%),
            linear-gradient(180deg, #dfe4d0 0%, #cad1bb 100%)
          `,
          fontFamily:
            '"Bahnschrift", "Malgun Gothic", "Noto Sans KR", sans-serif',
        },
        "::selection": {
          backgroundColor: alpha(palette.accent, 0.22),
        },
        ".App": {
          minHeight: "100vh",
        },
        "button, input, textarea": {
          font: "inherit",
        },
        "::-webkit-scrollbar": {
          width: 10,
          height: 10,
        },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(palette.accent, 0.4),
          borderRadius: 4,
        },
        "::-webkit-scrollbar-track": {
          backgroundColor: alpha(palette.card, 0.55),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          color: palette.text,
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${alpha(palette.border, 0.25)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: palette.surface,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 4,
          paddingInline: 14,
        },
        contained: {
          backgroundColor: palette.accent,
          color: palette.card,
          "&:hover": {
            backgroundColor: palette.accentStrong,
          },
        },
        outlined: {
          borderColor: alpha(palette.accent, 0.45),
          color: palette.text,
          backgroundColor: alpha(palette.card, 0.68),
          "&:hover": {
            borderColor: palette.accent,
            backgroundColor: alpha(palette.surfaceStrong, 0.7),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 600,
        },
        outlined: {
          backgroundColor: alpha(palette.card, 0.82),
          borderColor: alpha(palette.border, 0.55),
        },
        filled: {
          backgroundColor: palette.accent,
          color: palette.card,
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
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 4,
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 4,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: palette.text,
          borderRadius: 2,
          fontSize: "0.75rem",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(palette.card, 0.86),
          borderRadius: 4,
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(palette.accent, 0.5),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: palette.accent,
            borderWidth: 1,
          },
        },
        notchedOutline: {
          borderColor: alpha(palette.border, 0.45),
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
      },
    },
  },
});

export default fireScopeTheme;
