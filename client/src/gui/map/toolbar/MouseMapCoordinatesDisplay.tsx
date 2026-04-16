import { useContext } from "react";
import { Chip } from "@mui/material";
import { colorPalette } from "@/utils/constants";
import { MouseMapCoordinatesContext } from "@/gui/contextProviders/contexts/MouseMapCoordinatesContext";

const mouseMapCoordinatesDisplayStyle = {
  backgroundColor: colorPalette.white,
  color: colorPalette.black,
  border: `1px solid ${colorPalette.darkGray}`,
  fontSize: "12px",
  fontStyle: "normal",
  fontWeight: 500,
  boxShadow: "0 14px 30px rgba(0, 0, 0, 0.22)",
};

export default function MouseMapCoordinatesDisplay() {
  const { latitude, longitude } = useContext(MouseMapCoordinatesContext);

  return (
    <Chip
      label={"좌표: " + latitude.toFixed(2) + ", " + longitude.toFixed(2)}
      style={mouseMapCoordinatesDisplayStyle}
    />
  );
}
