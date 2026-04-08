import { useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/system";
import type { BundleModelSelection } from "@/gui/experience/bundleModels";
import type { AssetExperienceKind } from "@/gui/experience/assetExperience";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";
import { preloadBundleViewer } from "@/gui/experience/modelPreload";

const BUNDLE_VIEWER_REVISION = "20260406-kf21-boramae-facing-fix";

export interface BundleModelViewportSimulation {
  profile: ImmersiveExperienceProfile;
  operationMode: string;
  assetKind: AssetExperienceKind;
  className: string;
  modelId?: string;
  range?: number;
  heading?: number;
  speed?: number;
  weaponCount?: number;
  aircraftCount?: number;
  compareCount?: number;
}

interface BundleModelViewportProps {
  selection: BundleModelSelection;
  assetName: string;
  accentColor: string;
  glowColor: string;
  mode?: "detail" | "immersive";
  simulation?: BundleModelViewportSimulation | null;
  sx?: SxProps<Theme>;
  showBadge?: boolean;
  loading?: "eager" | "lazy";
}

function appendOptionalMetric(
  params: URLSearchParams,
  key: string,
  value: number | string | undefined
) {
  if (value === undefined || value === "") {
    return;
  }

  params.set(key, `${value}`);
}

export function buildViewerSrc(
  selection: BundleModelSelection,
  assetName: string,
  accentColor: string,
  glowColor: string,
  mode: "detail" | "immersive",
  simulation?: BundleModelViewportSimulation | null
) {
  const params = new URLSearchParams();
  params.set("model", selection.path);
  params.set("bundle", selection.bundle);
  params.set("label", selection.label);
  params.set("asset", assetName);
  params.set("note", selection.note);
  params.set("accent", accentColor);
  params.set("glow", glowColor);
  params.set("mode", mode);
  params.set("rev", BUNDLE_VIEWER_REVISION);
  params.set("modelId", simulation?.modelId ?? selection.id);

  if (mode === "immersive" && simulation) {
    params.set("profile", simulation.profile);
    params.set("operation", simulation.operationMode);
    params.set("assetKind", simulation.assetKind);
    params.set("className", simulation.className);
    appendOptionalMetric(params, "range", simulation.range);
    appendOptionalMetric(params, "heading", simulation.heading);
    appendOptionalMetric(params, "speed", simulation.speed);
    appendOptionalMetric(params, "weaponCount", simulation.weaponCount);
    appendOptionalMetric(params, "aircraftCount", simulation.aircraftCount);
    appendOptionalMetric(params, "compareCount", simulation.compareCount);
  }

  return `/3d-bundles/viewer/index.html?${params.toString()}`;
}

export default function BundleModelViewport({
  selection,
  assetName,
  accentColor,
  glowColor,
  mode = "detail",
  simulation,
  sx,
  showBadge = true,
  loading = "eager",
}: Readonly<BundleModelViewportProps>) {
  const src = buildViewerSrc(
    selection,
    assetName,
    accentColor,
    glowColor,
    mode,
    simulation
  );

  useEffect(() => {
    void preloadBundleViewer(selection);
  }, [selection.path]);

  return (
    <Box
      sx={[
        {
          position: "relative",
          overflow: "hidden",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="iframe"
        title={`${assetName} 3D model viewport`}
        src={src}
        loading={loading}
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          backgroundColor: "transparent",
        }}
      />

      {showBadge && (
        <Stack
          spacing={0.2}
          sx={{
            position: "absolute",
            left: 16,
            bottom: 16,
            zIndex: 1,
            px: 1.4,
            py: 0.9,
            borderRadius: 2,
            color: "#eef7ff",
            backgroundColor: "rgba(8, 16, 24, 0.72)",
            border: "1px solid rgba(198, 223, 255, 0.16)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography sx={{ fontSize: 11, letterSpacing: "0.12em" }}>
            연결된 3D 모델
          </Typography>
          <Typography sx={{ fontWeight: 800 }}>{selection.label}</Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(238, 247, 255, 0.72)" }}>
            {selection.note}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}
