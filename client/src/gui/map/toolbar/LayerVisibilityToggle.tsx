import LayersIcon from "@mui/icons-material/Layers";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { Box, Tooltip } from "@mui/material";
import { Popover } from "@/gui/shared/ui/MuiComponents";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import React, { useState } from "react";
import { colorPalette } from "@/utils/constants";
import type {
  BaseMapModeId,
  BaseMapModeOption,
} from "@/gui/map/mapLayers/BaseMapLayers";

interface LayerVisibilityPanelToggleProps {
  baseMapModes: BaseMapModeOption[];
  activeBaseMapModeId: BaseMapModeId;
  featureLabelVisibility: boolean;
  toggleFeatureLabelVisibility: (featureLabelVisibility: boolean) => void;
  threatRangeVisibility: boolean;
  toggleThreatRangeVisibility: (threatRangeVisibility: boolean) => void;
  routeVisibility: boolean;
  toggleRouteVisibility: (routeVisibility: boolean) => void;
  weaponTrajectoryVisibility: boolean;
  toggleWeaponTrajectoryVisibility: (
    weaponTrajectoryVisibility: boolean
  ) => void;
  toggleBaseMapLayer: () => void;
  toggleReferencePointVisibility: (referencePointVisibility: boolean) => void;
  referencePointVisibility: boolean;
  rightOffset?: number;
}

export default function LayerVisibilityPanelToggle(
  props: Readonly<LayerVisibilityPanelToggleProps>
) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "layer-visibility-panel" : undefined;
  const currentBaseMapMode =
    props.baseMapModes.find((mode) => mode.id === props.activeBaseMapModeId) ??
    props.baseMapModes[0];

  const toggleStyle = {
    border: 1,
    backgroundColor: colorPalette.white,
    color: colorPalette.black,
    borderRadius: "10px",
    borderColor: colorPalette.darkGray,
    borderWidth: "1px",
    justifyContent: "left",
    textTransform: "none",
    fontStyle: "normal",
    lineHeight: "normal",
    width: "100%",
    boxShadow: "0 14px 28px rgba(0, 0, 0, 0.18)",
  };
  const openLayersPanelButtonStyle = {
    border: `1px solid ${colorPalette.darkGray}`,
    backgroundColor: "rgba(7, 23, 29, 0.92)",
    backdropFilter: "blur(16px)",
    borderRadius: "10px",
    boxShadow: "0 14px 28px rgba(0, 0, 0, 0.24)",
  };
  const mapModeButtonStyle = {
    ...openLayersPanelButtonStyle,
    color: "var(--fs-text)",
    fontWeight: 600,
    paddingX: 1.1,
    textTransform: "none",
  };
  const layersVisibilityPanelStyle = {
    backgroundColor: colorPalette.lightGray,
    borderRadius: "12px",
    borderColor: colorPalette.darkGray,
    borderWidth: "1px",
    boxShadow: "0 18px 36px rgba(0, 0, 0, 0.28)",
  };

  const layerVisibilityPanelCard = (
    <Card variant="outlined" sx={layersVisibilityPanelStyle}>
      <CardActions>
        <Stack spacing={1} direction="column">
          <Tooltip
            title="지도 모드를 빠르게 순환합니다. 단축키: 6"
            placement="right"
          >
            <Button
              variant="outlined"
              sx={toggleStyle}
              onClick={() => {
                props.toggleBaseMapLayer();
                handleClose();
              }}
            >
              지도 모드 순환
            </Button>
          </Tooltip>
          <Tooltip title="항로 표시 전환. 단축키: 7" placement="right">
            <Button
              variant="outlined"
              sx={toggleStyle}
              onClick={() => {
                props.toggleRouteVisibility(!props.routeVisibility);
              }}
            >
              항로 표시 전환
            </Button>
          </Tooltip>
          <Tooltip title="무기 궤적 표시 전환" placement="right">
            <Button
              variant="outlined"
              sx={toggleStyle}
              onClick={() => {
                props.toggleWeaponTrajectoryVisibility(
                  !props.weaponTrajectoryVisibility
                );
              }}
            >
              무기 궤적 전환
            </Button>
          </Tooltip>
          <Tooltip title="위협 반경 표시 전환. 단축키: 8" placement="right">
            <Button
              variant="outlined"
              sx={toggleStyle}
              onClick={() => {
                props.toggleThreatRangeVisibility(!props.threatRangeVisibility);
              }}
            >
              위협 반경 전환
            </Button>
          </Tooltip>
          <Tooltip title="라벨 표시 전환. 단축키: 9" placement="right">
            <Button
              variant="outlined"
              sx={toggleStyle}
              onClick={() => {
                props.toggleFeatureLabelVisibility(
                  !props.featureLabelVisibility
                );
              }}
            >
              라벨 표시 전환
            </Button>
          </Tooltip>
          <Button
            variant="outlined"
            sx={toggleStyle}
            onClick={() => {
              props.toggleReferencePointVisibility(
                !props.referencePointVisibility
              );
            }}
          >
            참조점 표시 전환
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );

  return (
    <>
      <Box
        sx={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 4.5rem)",
          right: props.rightOffset ?? 16,
          fontSize: "small",
          zIndex: 1000,
        }}
      >
        <Stack direction="row" spacing={1}>
          <Tooltip
            title="클릭할 때마다 지도 모드를 전환합니다."
            placement="left"
          >
            <Button
              disableRipple
              size="small"
              startIcon={<MapOutlinedIcon fontSize="small" />}
              onClick={props.toggleBaseMapLayer}
              disabled={props.baseMapModes.length <= 1}
              sx={{
                ...mapModeButtonStyle,
                minWidth: "auto",
                maxWidth: "min(42vw, 180px)",
                whiteSpace: "nowrap",
              }}
            >
              지도: {currentBaseMapMode?.label ?? "OSM"}
            </Button>
          </Tooltip>
          <Box sx={openLayersPanelButtonStyle}>
            <Tooltip title="레이어 제어" placement="left">
              <IconButton
                aria-label="레이어 제어"
                disableRipple
                onClick={handleClick}
                size="medium"
              >
                <LayersIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Box>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 50,
          horizontal: "left",
        }}
      >
        {layerVisibilityPanelCard}
      </Popover>
    </>
  );
}
