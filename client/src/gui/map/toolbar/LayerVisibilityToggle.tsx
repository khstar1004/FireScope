import LayersIcon from "@mui/icons-material/Layers";
import { Box, Tooltip } from "@mui/material";
import { Popover } from "@/gui/shared/ui/MuiComponents";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import React, { useState } from "react";
import { colorPalette } from "@/utils/constants";
import { useAuth0 } from "@auth0/auth0-react";

interface LayerVisibilityPanelToggleProps {
  featureLabelVisibility: boolean;
  toggleFeatureLabelVisibility: (featureLabelVisibility: boolean) => void;
  threatRangeVisibility: boolean;
  toggleThreatRangeVisibility: (threatRangeVisibility: boolean) => void;
  routeVisibility: boolean;
  toggleRouteVisibility: (routeVisibility: boolean) => void;
  toggleBaseMapLayer: () => void;
  toggleReferencePointVisibility: (referencePointVisibility: boolean) => void;
  referencePointVisibility: boolean;
}

export default function LayerVisibilityPanelToggle(
  props: Readonly<LayerVisibilityPanelToggleProps>
) {
  const { isAuthenticated } = useAuth0();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "layer-visibility-panel" : undefined;

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
    position: "absolute",
    top: "4em",
    right: "0.2em",
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
            title={
              isAuthenticated
                ? "지도 전환. 단축키: 5"
                : "더 많은 지도를 보려면 로그인하세요"
            }
            placement="right"
          >
            <Button
              variant="outlined"
              sx={toggleStyle}
              onClick={props.toggleBaseMapLayer}
            >
              기본 지도 전환
            </Button>
          </Tooltip>
          <Tooltip title="항로 표시 전환. 단축키: 6" placement="right">
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
          <Tooltip title="위협 반경 표시 전환. 단축키: 7" placement="right">
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
          <Tooltip title="라벨 표시 전환. 단축키: 8" placement="right">
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
      <div
        style={{
          position: "absolute",
          top: "1em",
          right: "1em",
          fontSize: "small",
          zIndex: 1000,
        }}
      >
        <Box sx={openLayersPanelButtonStyle}>
          <Tooltip title="레이어 제어" placement="left">
            <IconButton disableRipple onClick={handleClick} size="medium">
              <LayersIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </div>

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
