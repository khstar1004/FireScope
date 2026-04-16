import { useContext } from "react";
import { Chip } from "@mui/material";
import { unixToLocalTime } from "@/utils/dateTimeFunctions";
import { colorPalette } from "@/utils/constants";
import { ScenarioTimeContext } from "@/gui/contextProviders/contexts/ScenarioTimeContext";

const scenarioTimeDisplayStyle = {
  backgroundColor: colorPalette.white,
  color: colorPalette.black,
  border: `1px solid ${colorPalette.darkGray}`,
  fontSize: "12px",
  fontStyle: "normal",
  fontWeight: 500,
  boxShadow: "0 14px 30px rgba(0, 0, 0, 0.22)",
};

export default function ScenarioTimeDisplay() {
  const currentScenarioTime = useContext(ScenarioTimeContext);

  return (
    <Chip
      label={"현재 시각: " + unixToLocalTime(currentScenarioTime)}
      style={scenarioTimeDisplayStyle}
    />
  );
}
