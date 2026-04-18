import { SIDE_COLOR } from "@/utils/colors";
import DroneIconSvg from "@/gui/assets/svg/drone_black_24dp.svg?react";
import TankIconSvg from "@/gui/assets/svg/tank_black_24dp.svg?react";
import {
  Brightness1,
  DirectionsBoat,
  Flight,
  FlightTakeoff,
  Help,
  PinDrop,
  Radar,
  DoubleArrow,
} from "@mui/icons-material";
import SvgIcon from "@mui/material/SvgIcon";
import { ToolbarEntityType } from "@/utils/assetTypeCatalog";

export interface IEntityIconProps {
  type: ToolbarEntityType | string;
  width?: number;
  height?: number;
  color?: SIDE_COLOR | string;
}

export default function EntityIcon({
  type,
  width = 24,
  height = 24,
  color = "var(--fs-text)",
}: Readonly<IEntityIconProps>) {
  const customIconSx = {
    width: width * 0.88,
    height: height * 0.88,
    color: color,
  };

  switch (type) {
    case "aircraft":
      return (
        <Flight
          sx={{
            width: width,
            height: height,
            color: color,
          }}
        />
      );
    case "drone":
      return (
        <SvgIcon component={DroneIconSvg} inheritViewBox sx={customIconSx} />
      );
    case "airbase":
      return (
        <FlightTakeoff
          sx={{
            width: width,
            height: height,
            color: color,
          }}
        />
      );
    case "tank":
    case "army":
      return (
        <SvgIcon component={TankIconSvg} inheritViewBox sx={customIconSx} />
      );
    case "ship":
      return (
        <DirectionsBoat
          sx={{
            width: width,
            height: height,
            color: color,
          }}
        />
      );
    case "facility":
      return (
        <Radar
          sx={{
            width: width,
            height: height,
            color: color,
          }}
        />
      );
    case "referencePoint":
      return (
        <PinDrop
          sx={{
            width: width,
            height: height,
            color: color,
          }}
        />
      );
    case "weapon":
      return (
        <DoubleArrow
          sx={{
            width: width,
            height: height,
            color: color,
          }}
        />
      );
    case "circle":
      return (
        <Brightness1
          sx={{
            width: width,
            height: height,
            color: color,
          }}
        />
      );
    default:
      return (
        <Help
          sx={{
            width: width,
            height: height,
            color: color,
          }}
        />
      );
  }
}
