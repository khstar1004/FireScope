import { useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BundleModelViewport, {
  type BundleModelViewportSimulation,
  type BundleViewerComparisonSelection,
  type BundleViewerLineupEntry,
} from "@/gui/experience/BundleModelViewport";
import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import type { VistaSummary } from "@/gui/experience/vistaState";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";
import type { ImmersiveLiveTwinFeed } from "@/gui/experience/immersiveLiveTwin";

export interface BattleSpectatorHeroViewportMetric {
  label: string;
  value: string;
}

export interface BattleSpectatorHeroViewportState {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  accentColor: string;
  glowColor: string;
  asset: AssetExperienceSummary;
  selection: BundleModelSelection;
  profile: ImmersiveExperienceProfile;
  simulation: BundleModelViewportSimulation;
  badges: string[];
  metrics: BattleSpectatorHeroViewportMetric[];
  comparisonSelections: BundleViewerComparisonSelection[];
  lineup: BundleViewerLineupEntry[];
  summary: VistaSummary | null;
  feed: ImmersiveLiveTwinFeed;
}

interface BattleSpectatorHeroViewportProps {
  view: BattleSpectatorHeroViewportState;
  onClose: () => void;
}

function formatProfileLabel(profile: ImmersiveExperienceProfile) {
  switch (profile) {
    case "ground":
      return "GROUND";
    case "fires":
      return "FIRES";
    case "defense":
      return "DEFENSE";
    case "maritime":
      return "MARITIME";
    case "base":
      return "AIR";
  }
}

export default function BattleSpectatorHeroViewport({
  view,
  onClose,
}: Readonly<BattleSpectatorHeroViewportProps>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const summaryChips = view.summary
    ? [
        `POSTURE ${view.summary.postureLabel}`,
        `READY ${view.summary.readinessPct}%`,
        `LOG ${view.summary.logisticsPct}%`,
        `COVER ${view.summary.coveragePct}%`,
      ]
    : [];

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <BundleModelViewport
        selection={view.selection}
        assetName={view.asset.name}
        accentColor={view.accentColor}
        glowColor={view.glowColor}
        mode="immersive"
        simulation={view.simulation}
        viewerChrome="minimal"
        comparisonSelections={view.comparisonSelections}
        lineup={view.lineup}
        contextMode="focus"
        showLineupMarkers={view.lineup.length > 0}
        showBadge={false}
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 54%, transparent 0%, transparent 28%, rgba(2, 6, 12, 0.18) 55%, rgba(2, 6, 12, 0.5) 100%), linear-gradient(180deg, rgba(2, 6, 12, 0.84) 0%, rgba(2, 6, 12, 0.06) 26%, rgba(2, 6, 12, 0.14) 64%, rgba(2, 6, 12, 0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          height: "100%",
          p: { xs: 1.4, md: 2.2 },
          gap: { xs: 1.25, md: 1.8 },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "flex-start" }}
          spacing={1.2}
        >
          <Stack
            spacing={0.9}
            sx={{
              maxWidth: 720,
              px: { xs: 1.25, md: 1.7 },
              py: { xs: 1.1, md: 1.4 },
              borderRadius: 3,
              border: `1px solid ${view.accentColor}33`,
              background:
                "linear-gradient(180deg, rgba(6, 12, 20, 0.78) 0%, rgba(6, 12, 20, 0.54) 100%)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 18px 42px rgba(0, 0, 0, 0.28)",
              pointerEvents: "auto",
            }}
          >
            <Typography
              sx={{
                fontSize: 11,
                letterSpacing: "0.18em",
                color: view.accentColor,
              }}
            >
              집중 추적 뷰
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 24, md: 34 },
                fontWeight: 900,
                lineHeight: 1,
                color: "#eef7ff",
              }}
            >
              {view.title}
            </Typography>
            <Typography
              sx={{
                fontSize: 13.2,
                color: "rgba(238, 247, 255, 0.78)",
              }}
            >
              {view.subtitle}
            </Typography>
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              {[
                `PROFILE ${formatProfileLabel(view.profile)}`,
                ...view.badges,
                ...(view.comparisonSelections.length > 0
                  ? [`COMPARE ${view.comparisonSelections.length + 1}`]
                  : []),
              ].map((badge) => (
                <Box
                  key={badge}
                  sx={{
                    px: 1,
                    py: 0.45,
                    borderRadius: 999,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.4,
                      letterSpacing: "0.1em",
                      color: "rgba(238, 247, 255, 0.88)",
                    }}
                  >
                    {badge}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
              {summaryChips.map((chip) => (
                <Box
                  key={chip}
                  sx={{
                    px: 1,
                    py: 0.4,
                    borderRadius: 999,
                    border: `1px solid ${view.accentColor}22`,
                    backgroundColor: `${view.accentColor}14`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.1,
                      letterSpacing: "0.08em",
                      color: view.accentColor,
                    }}
                  >
                    {chip}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>

          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              alignSelf: { xs: "flex-start", md: "stretch" },
              minWidth: 0,
              color: "#eef7ff",
              borderColor: "rgba(238, 247, 255, 0.18)",
              backdropFilter: "blur(12px)",
              backgroundColor: "rgba(6, 12, 20, 0.48)",
              pointerEvents: "auto",
            }}
          >
            월드 관전으로 복귀
          </Button>
        </Stack>

        <Box />

        <Stack
          direction={{ xs: "column", xl: "row" }}
          spacing={1.2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", xl: "flex-end" }}
        >
          <Stack
            spacing={1.05}
            sx={{
              flex: 1.15,
              minWidth: 0,
            }}
          >
            <Stack
              spacing={0.55}
              sx={{
                px: { xs: 1.2, md: 1.45 },
                py: { xs: 0.95, md: 1.2 },
                borderRadius: 2.5,
                border: `1px solid ${view.accentColor}26`,
                background:
                  "linear-gradient(180deg, rgba(5, 10, 18, 0.78) 0%, rgba(5, 10, 18, 0.56) 100%)",
                backdropFilter: "blur(16px)",
                pointerEvents: "auto",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.8,
                  letterSpacing: "0.14em",
                  color: view.accentColor,
                }}
              >
                LIVE FIRE PREVIEW
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#eef7ff",
                }}
              >
                {view.detail}
              </Typography>
            </Stack>

            <Box
              sx={{
                px: { xs: 1.2, md: 1.45 },
                py: { xs: 0.95, md: 1.15 },
                borderRadius: 2.5,
                border: "1px solid rgba(238, 247, 255, 0.1)",
                background:
                  "linear-gradient(180deg, rgba(5, 10, 18, 0.82) 0%, rgba(5, 10, 18, 0.6) 100%)",
                backdropFilter: "blur(16px)",
                pointerEvents: "auto",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.8,
                  letterSpacing: "0.14em",
                  color: "rgba(238, 247, 255, 0.66)",
                }}
              >
                LIVE FEED
              </Typography>
              <Typography
                sx={{
                  mt: 0.45,
                  fontSize: 13.2,
                  fontWeight: 700,
                  color: "#eef7ff",
                }}
              >
                {view.feed.eventHeadline}
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: 11.5,
                  color: "rgba(238, 247, 255, 0.66)",
                }}
              >
                {view.feed.sourceLabel} · {view.feed.timeLabel}
              </Typography>
              <Stack spacing={0.45} sx={{ mt: 0.95 }}>
                {view.feed.eventItems.map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      fontSize: 12.3,
                      color: "rgba(238, 247, 255, 0.84)",
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>
              {view.feed.metrics.length > 0 && (
                <Stack
                  direction="row"
                  spacing={0.7}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ mt: 0.95 }}
                >
                  {view.feed.metrics.map((metric) => (
                    <Box
                      key={`${metric.label}:${metric.value}`}
                      sx={{
                        px: 0.85,
                        py: 0.5,
                        borderRadius: 1.3,
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        backgroundColor: "rgba(255, 255, 255, 0.04)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10.4,
                          color: "rgba(238, 247, 255, 0.88)",
                        }}
                      >
                        {metric.label} {metric.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 1.15, md: 1.35 },
              py: { xs: 1, md: 1.15 },
              borderRadius: 2.6,
              border: "1px solid rgba(238, 247, 255, 0.12)",
              background:
                "linear-gradient(180deg, rgba(5, 10, 18, 0.82) 0%, rgba(5, 10, 18, 0.58) 100%)",
              backdropFilter: "blur(16px)",
              pointerEvents: "auto",
            }}
          >
            <Typography
              sx={{
                fontSize: 10.8,
                letterSpacing: "0.14em",
                color: "rgba(238, 247, 255, 0.66)",
              }}
            >
              실시간 제원
            </Typography>
            <Box
              sx={{
                mt: 0.85,
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 0.9,
              }}
            >
              {view.metrics.map((metric) => (
                <Box
                  key={metric.label}
                  sx={{
                    px: 0.95,
                    py: 0.8,
                    borderRadius: 1.8,
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      color: "rgba(238, 247, 255, 0.6)",
                    }}
                  >
                    {metric.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.2,
                      fontSize: 12.8,
                      fontWeight: 800,
                      color: "#eef7ff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {metric.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            sx={{
              flex: 0.95,
              minWidth: { xs: "100%", xl: 320 },
              px: { xs: 1.15, md: 1.35 },
              py: { xs: 1, md: 1.15 },
              borderRadius: 2.6,
              border: "1px solid rgba(238, 247, 255, 0.12)",
              background:
                "linear-gradient(180deg, rgba(5, 10, 18, 0.82) 0%, rgba(5, 10, 18, 0.58) 100%)",
              backdropFilter: "blur(16px)",
              pointerEvents: "auto",
            }}
          >
            <Typography
              sx={{
                fontSize: 10.8,
                letterSpacing: "0.14em",
                color: "rgba(238, 247, 255, 0.66)",
              }}
            >
              연동 전력
            </Typography>
            <Stack spacing={0.8} sx={{ mt: 0.9 }}>
              {view.lineup.slice(0, 4).map((entry) => (
                <Box
                  key={entry.id}
                  sx={{
                    px: 0.95,
                    py: 0.82,
                    borderRadius: 1.8,
                    border: `1px solid ${
                      entry.primary ? `${view.accentColor}2d` : "rgba(255, 255, 255, 0.08)"
                    }`,
                    backgroundColor: entry.primary
                      ? `${view.accentColor}14`
                      : "rgba(255, 255, 255, 0.04)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.1,
                      letterSpacing: "0.08em",
                      color: entry.primary
                        ? view.accentColor
                        : "rgba(238, 247, 255, 0.58)",
                    }}
                  >
                    {entry.section} · {entry.role}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.18,
                      fontSize: 12.7,
                      fontWeight: 800,
                      color: "#eef7ff",
                    }}
                  >
                    {entry.label}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.16,
                      fontSize: 11.4,
                      color: "rgba(238, 247, 255, 0.7)",
                    }}
                  >
                    {entry.task} · {entry.status}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.16,
                      fontSize: 10.8,
                      color: "rgba(238, 247, 255, 0.6)",
                    }}
                  >
                    READY {entry.readinessPct}% · FUEL {entry.fuelPct}% · ORD{" "}
                    {entry.ordnancePct}%
                  </Typography>
                </Box>
              ))}
              {view.lineup.length === 0 && (
                <Typography
                  sx={{
                    fontSize: 12.2,
                    color: "rgba(238, 247, 255, 0.68)",
                  }}
                >
                  현재 focus 대상 기준으로 연동 가능한 지원 전력이 없습니다.
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
