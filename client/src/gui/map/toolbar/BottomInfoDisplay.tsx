import type { ReactNode } from "react";
import { Stack } from "@mui/material";
import MouseMapCoordinatesDisplay from "@/gui/map/toolbar/MouseMapCoordinatesDisplay";
import ScenarioTimeDisplay from "@/gui/map/toolbar/ScenarioTimeDisplay";
import FixedTargetStrikeReplayPanel from "@/gui/map/toolbar/FixedTargetStrikeReplayPanel";
import SelectedUnitStatusCard, {
  type SelectedCombatantSummary,
} from "@/gui/map/toolbar/SelectedUnitStatusCard";
import { FixedTargetStrikeReplayMetric } from "@/scenarios/fixedTargetStrikeRlDemo";

interface IBottomInfoDisplay {
  mobileView: boolean;
  replayMetric?: FixedTargetStrikeReplayMetric | null;
  selectedCombatant?: SelectedCombatantSummary | null;
  focusFireDock?: ReactNode;
}

export default function BottomInfoDisplay(props: Readonly<IBottomInfoDisplay>) {
  return (
    <div
      style={{
        position: "absolute",
        right: "1em",
        left: props.mobileView ? "1em" : "auto",
        bottom: "1em",
        zIndex: 1000,
      }}
    >
      <Stack
        spacing={1.5}
        sx={{ alignItems: props.mobileView ? "stretch" : "flex-end" }}
      >
        {props.focusFireDock}
        {props.selectedCombatant && (
          <SelectedUnitStatusCard
            combatant={props.selectedCombatant}
            mobileView={props.mobileView}
          />
        )}
        {props.replayMetric && (
          <FixedTargetStrikeReplayPanel metric={props.replayMetric} />
        )}
        <Stack
          direction={props.mobileView ? "column" : "row"}
          sx={
            props.mobileView
              ? { flexDirection: "column-reverse", gap: 1.5 }
              : null
          }
          spacing={1.5}
        >
          <MouseMapCoordinatesDisplay />
          <ScenarioTimeDisplay />
        </Stack>
      </Stack>
    </div>
  );
}
