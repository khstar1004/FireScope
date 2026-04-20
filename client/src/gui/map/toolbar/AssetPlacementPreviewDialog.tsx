import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ClearIcon from "@mui/icons-material/Clear";
import AssetExperienceViewer from "@/gui/experience/AssetExperienceViewer";
import BundleModelViewport from "@/gui/experience/BundleModelViewport";
import type { AssetPlacementPreview } from "@/gui/map/toolbar/assetPlacementPreview";

interface PreviewPalette {
  accentColor: string;
  glowColor: string;
  borderColor: string;
  background: string;
}

interface AssetPlacementPreviewDialogProps {
  preview: AssetPlacementPreview | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function getPreviewPalette(
  kind: AssetPlacementPreview["asset"]["kind"]
): PreviewPalette {
  switch (kind) {
    case "aircraft":
      return {
        accentColor: "#7dc7ff",
        glowColor: "#57f0ff",
        borderColor: "rgba(125, 199, 255, 0.24)",
        background:
          "radial-gradient(circle at top, rgba(20, 48, 79, 0.96), rgba(7, 16, 29, 0.98) 56%, rgba(3, 8, 14, 1) 100%)",
      };
    case "airbase":
      return {
        accentColor: "#d4b87c",
        glowColor: "#8fe1ff",
        borderColor: "rgba(212, 184, 124, 0.24)",
        background:
          "radial-gradient(circle at top, rgba(62, 52, 32, 0.96), rgba(18, 15, 11, 0.98) 56%, rgba(6, 5, 4, 1) 100%)",
      };
    case "facility":
      return {
        accentColor: "#95ffa0",
        glowColor: "#5bf0d2",
        borderColor: "rgba(149, 255, 160, 0.22)",
        background:
          "radial-gradient(circle at top, rgba(23, 56, 29, 0.96), rgba(8, 18, 11, 0.98) 56%, rgba(4, 8, 5, 1) 100%)",
      };
    case "ship":
      return {
        accentColor: "#69d4ff",
        glowColor: "#3df0d4",
        borderColor: "rgba(105, 212, 255, 0.24)",
        background:
          "radial-gradient(circle at top, rgba(16, 55, 75, 0.96), rgba(7, 18, 25, 0.98) 56%, rgba(3, 7, 11, 1) 100%)",
      };
    case "weapon":
      return {
        accentColor: "#ff9a5a",
        glowColor: "#ffd866",
        borderColor: "rgba(255, 154, 90, 0.22)",
        background:
          "radial-gradient(circle at top, rgba(67, 38, 18, 0.96), rgba(19, 13, 10, 0.98) 56%, rgba(6, 4, 4, 1) 100%)",
      };
  }
}

function formatMetricValue(
  value: number | undefined,
  suffix: string,
  fractionDigits = 0
) {
  if (value === undefined) {
    return null;
  }

  return `${new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)} ${suffix}`.trim();
}

function formatHeadingDirection(headingDegrees: number) {
  const normalizedHeading = ((headingDegrees % 360) + 360) % 360;
  const labels = [
    "북",
    "북북동",
    "북동",
    "동북동",
    "동",
    "동남동",
    "남동",
    "남남동",
    "남",
    "남남서",
    "남서",
    "서남서",
    "서",
    "서북서",
    "북서",
    "북북서",
  ];
  const bucket = Math.round(normalizedHeading / 22.5) % labels.length;

  return `${labels[bucket]} (${Math.round(normalizedHeading)}deg)`;
}

export default function AssetPlacementPreviewDialog({
  preview,
  open,
  onClose,
  onConfirm,
}: Readonly<AssetPlacementPreviewDialogProps>) {
  if (!preview) {
    return null;
  }

  const palette = getPreviewPalette(preview.asset.kind);
  const speedLabel = formatMetricValue(preview.asset.speed, "KTS");
  const rangeLabel = formatMetricValue(preview.asset.range, "NM");
  const fuelLabel =
    preview.asset.currentFuel !== undefined &&
    preview.asset.maxFuel !== undefined
      ? `${formatMetricValue(preview.asset.currentFuel, "LBS")} / ${formatMetricValue(preview.asset.maxFuel, "LBS")}`
      : null;
  const aircraftCountLabel = formatMetricValue(
    preview.asset.aircraftCount,
    "EA"
  );
  const visualPolicyDetails = preview.visualPolicyDetails;
  const presetDetails = preview.presetContext
    ? [
        { label: "권역", value: preview.presetContext.regionLabel },
        { label: "담당 축선", value: preview.presetContext.coverageLabel },
        { label: "현재 위협축", value: preview.presetContext.threatAxisLabel },
        {
          label: "대표 장비",
          value: preview.presetContext.representativeAssetLabel,
        },
        { label: "자료 근거", value: preview.presetContext.sourceLabel },
      ].filter(
        (detail): detail is { label: string; value: string } =>
          Boolean(detail.value)
      )
    : [];
  const deploymentDetails = preview.deploymentDefaults
    ? [
        {
          label: "권장 방위",
          value: formatHeadingDirection(
            preview.deploymentDefaults.headingDegrees
          ),
        },
        {
          label: "부채꼴",
          value: `${preview.deploymentDefaults.arcDegrees ?? 120}deg`,
        },
        {
          label: "추천 근거",
          value: preview.deploymentDefaults.recommendationLabel ?? "",
        },
        {
          label: "유효 사거리",
          value: rangeLabel ?? "DB 미상",
        },
        preview.deploymentDefaults.formation
          ? {
              label: "포대 편성",
              value: `${preview.deploymentDefaults.formation.unitCount}개 포대`,
            }
          : null,
        preview.deploymentDefaults.formation
          ? {
              label: "포대 간격",
              value: `${preview.deploymentDefaults.formation.lateralSpacingKm} km`,
            }
          : null,
        preview.deploymentDefaults.formation?.templateLabel
          ? {
              label: "템플릿",
              value: preview.deploymentDefaults.formation.templateLabel,
            }
          : null,
      ]
        .filter(
          (detail): detail is { label: string; value: string } =>
            Boolean(detail?.value)
        )
    : [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          overflow: "hidden",
          color: "#eef7ff",
          borderRadius: 3,
          border: "1px solid rgba(45, 214, 196, 0.2)",
          background:
            "linear-gradient(180deg, rgba(9, 22, 28, 0.98) 0%, rgba(5, 14, 18, 1) 100%)",
          boxShadow: "0 36px 96px rgba(0, 0, 0, 0.52)",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2.2,
          borderBottom: "1px solid rgba(45, 214, 196, 0.16)",
          background:
            "linear-gradient(180deg, rgba(12, 31, 39, 0.98), rgba(8, 22, 28, 0.94))",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.14em",
                color: "rgba(125, 199, 255, 0.76)",
              }}
            >
              ASSET PLACEMENT PREVIEW
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.6, fontWeight: 800 }}>
              {preview.displayName}
            </Typography>
            <Typography sx={{ mt: 0.7, color: "rgba(226, 240, 255, 0.72)" }}>
              3D 모델을 먼저 확인한 뒤 배치를 시작합니다.
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "#eef7ff" }}>
            <ClearIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{ minHeight: { md: 520 } }}
        >
          <Stack
            spacing={1.4}
            sx={{
              width: { xs: "100%", md: 330 },
              px: 3,
              py: 2.6,
              borderRight: {
                xs: "none",
                md: "1px solid rgba(45, 214, 196, 0.14)",
              },
              borderBottom: {
                xs: "1px solid rgba(45, 214, 196, 0.14)",
                md: "none",
              },
              background:
                "linear-gradient(180deg, rgba(6, 18, 24, 0.9), rgba(5, 14, 18, 0.76))",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip
                size="small"
                label={preview.entityLabel}
                sx={{
                  color: "#eef7ff",
                  borderColor: "rgba(125, 199, 255, 0.32)",
                }}
                variant="outlined"
              />
              <Chip
                size="small"
                label={preview.previewBadgeLabel}
                sx={{
                  color: "#eef7ff",
                  borderColor: "rgba(45, 214, 196, 0.3)",
                }}
                variant="outlined"
              />
            </Stack>

            <Box
              sx={{
                p: 1.6,
                borderRadius: 2.5,
                border: "1px solid rgba(45, 214, 196, 0.14)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <Typography
                sx={{ fontSize: 12, color: "rgba(226,240,255,0.62)" }}
              >
                원본 클래스
              </Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 700 }}>
                {preview.unitClassName}
              </Typography>
              <Typography
                sx={{
                  mt: 1.4,
                  fontSize: 12,
                  color: "rgba(226,240,255,0.62)",
                }}
              >
                현재 세력
              </Typography>
              <Typography sx={{ mt: 0.5, fontWeight: 700 }}>
                {preview.asset.sideName}
              </Typography>
            </Box>

            {(preview.model || preview.previewMode === "concept") && (
              <Box
                sx={{
                  p: 1.6,
                  borderRadius: 2.5,
                  border: "1px solid rgba(125, 199, 255, 0.18)",
                  backgroundColor: "rgba(125, 199, 255, 0.06)",
                }}
              >
                <Typography
                  sx={{ fontSize: 12, color: "rgba(226,240,255,0.62)" }}
                >
                  {preview.previewTitle}
                </Typography>
                {preview.model && (
                  <Typography sx={{ mt: 0.55, fontWeight: 800 }}>
                    {preview.model.label}
                  </Typography>
                )}
                <Typography
                  sx={{
                    mt: preview.model ? 0.7 : 0.55,
                    fontSize: 13,
                    color: "rgba(226, 240, 255, 0.72)",
                  }}
                >
                  {preview.previewDescription}
                </Typography>
              </Box>
            )}

            {visualPolicyDetails.length > 0 && (
              <Box
                sx={{
                  p: 1.6,
                  borderRadius: 2.5,
                  border: "1px solid rgba(143, 225, 255, 0.18)",
                  backgroundColor: "rgba(143, 225, 255, 0.05)",
                }}
              >
                <Typography
                  sx={{ fontSize: 12, color: "rgba(226,240,255,0.62)" }}
                >
                  시각화 정책
                </Typography>
                <Stack spacing={0.95} sx={{ mt: 0.85 }}>
                  {visualPolicyDetails.map((detail) => (
                    <Box
                      key={detail.label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Typography sx={{ color: "rgba(226, 240, 255, 0.68)" }}>
                        {detail.label}
                      </Typography>
                      <Typography
                        sx={{ textAlign: "right", fontWeight: 700 }}
                      >
                        {detail.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {presetDetails.length > 0 && (
              <Box
                sx={{
                  p: 1.6,
                  borderRadius: 2.5,
                  border: "1px solid rgba(149, 255, 160, 0.16)",
                  backgroundColor: "rgba(149, 255, 160, 0.05)",
                }}
              >
                <Typography
                  sx={{ fontSize: 12, color: "rgba(226,240,255,0.62)" }}
                >
                  프리셋 정보
                </Typography>
                <Stack spacing={0.95} sx={{ mt: 0.85 }}>
                  {presetDetails.map((detail) => (
                    <Box
                      key={detail.label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Typography sx={{ color: "rgba(226, 240, 255, 0.68)" }}>
                        {detail.label}
                      </Typography>
                      <Typography
                        sx={{ textAlign: "right", fontWeight: 700 }}
                      >
                        {detail.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {deploymentDetails.length > 0 && (
              <Box
                sx={{
                  p: 1.6,
                  borderRadius: 2.5,
                  border: "1px solid rgba(255, 214, 102, 0.18)",
                  backgroundColor: "rgba(255, 214, 102, 0.05)",
                }}
              >
                <Typography
                  sx={{ fontSize: 12, color: "rgba(226,240,255,0.62)" }}
                >
                  권장 전개
                </Typography>
                <Stack spacing={0.95} sx={{ mt: 0.85 }}>
                  {deploymentDetails.map((detail) => (
                    <Box
                      key={detail.label}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                      }}
                    >
                      <Typography sx={{ color: "rgba(226, 240, 255, 0.68)" }}>
                        {detail.label}
                      </Typography>
                      <Typography
                        sx={{ textAlign: "right", fontWeight: 700 }}
                      >
                        {detail.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            <Stack spacing={1}>
              {speedLabel && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ color: "rgba(226, 240, 255, 0.68)" }}>
                    속도
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{speedLabel}</Typography>
                </Box>
              )}
              {rangeLabel && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ color: "rgba(226, 240, 255, 0.68)" }}>
                    작전 반경
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{rangeLabel}</Typography>
                </Box>
              )}
              {fuelLabel && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ color: "rgba(226, 240, 255, 0.68)" }}>
                    연료
                  </Typography>
                  <Typography sx={{ textAlign: "right", fontWeight: 700 }}>
                    {fuelLabel}
                  </Typography>
                </Box>
              )}
              {aircraftCountLabel && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ color: "rgba(226, 240, 255, 0.68)" }}>
                    수용 항공기
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>
                    {aircraftCountLabel}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Typography sx={{ mt: "auto", color: "rgba(226, 240, 255, 0.68)" }}>
              배치하기를 누르면 지도 클릭 모드로 전환됩니다.
            </Typography>
          </Stack>

          <Box
            sx={{
              flex: 1,
              p: { xs: 2, md: 2.4 },
              background: palette.background,
            }}
          >
            {preview.model ? (
              <BundleModelViewport
                selection={preview.model}
                assetName={preview.displayName}
                accentColor={palette.accentColor}
                glowColor={palette.glowColor}
                viewerChrome="minimal"
                sceneProps={preview.sceneProps}
                showBadge={false}
                sx={{
                  minHeight: { xs: 320, md: 472 },
                  borderRadius: 3,
                  border: `1px solid ${palette.borderColor}`,
                  background:
                    "linear-gradient(180deg, rgba(9, 16, 28, 0.96), rgba(5, 10, 18, 0.98))",
                  boxShadow: "0 28px 80px rgba(0, 0, 0, 0.42)",
                }}
              />
            ) : (
              <Box
                sx={{
                  minHeight: { xs: 320, md: 472 },
                  borderRadius: 3,
                  border: `1px solid ${palette.borderColor}`,
                  background:
                    "linear-gradient(180deg, rgba(9, 16, 28, 0.96), rgba(5, 10, 18, 0.98))",
                }}
              >
                <AssetExperienceViewer
                  kind={preview.asset.kind}
                  conceptVariant={preview.conceptVariant ?? undefined}
                  accentColor={palette.accentColor}
                  glowColor={palette.glowColor}
                />
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid rgba(45, 214, 196, 0.14)",
          background:
            "linear-gradient(180deg, rgba(7, 18, 24, 0.95), rgba(5, 14, 18, 1))",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#eef7ff",
            borderColor: "rgba(125, 199, 255, 0.28)",
          }}
        >
          취소
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            px: 2.5,
            fontWeight: 700,
            color: "#031114",
            background:
              "linear-gradient(135deg, rgba(45, 214, 196, 1), rgba(125, 199, 255, 1))",
          }}
        >
          배치하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
