import { useContext, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import Card from "@mui/material/Card";
import { colorPalette } from "@/utils/constants";
import Aircraft from "@/game/units/Aircraft";
import ReferencePoint from "@/game/units/ReferencePoint";
import { Target } from "@/game/engine/weaponEngagement";
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  FormControl,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SelectField from "@/gui/shared/ui/SelectField";
import TextField from "@/gui/shared/ui/TextField";
import { ToastContext } from "@/gui/contextProviders/contexts/ToastContext";
import Game from "@/game/Game";
import FireRecommendationPanel, {
  FireRecommendationPriorityList,
} from "@/gui/fires/FireRecommendationPanel";

interface MissionCreatorCardProps {
  game: Game;
  sideId: string;
  initialMissionType?: "Patrol" | "Strike";
  initialSelectedTargetIds?: string[];
  aircraft: Aircraft[];
  referencePoints: ReferencePoint[];
  targets: Target[];
  handleCloseOnMap: () => void;
  createPatrolMission: (
    missionName: string,
    assignedUnits: string[],
    referencePoints: string[]
  ) => void;
  createStrikeMission: (
    missionName: string,
    assignedUnits: string[],
    targetIds: string[]
  ) => void;
}

const cardContentStyle = {
  display: "flex",
  flexDirection: "column",
  rowGap: "10px",
};

const closeButtonStyle = {
  bottom: 5.5,
};

const cardHeaderStyle = {
  backgroundColor: colorPalette.white,
  color: "var(--fs-text)",
  height: "50px",
};

const cardStyle = {
  minWidth: "400px",
  maxWidth: "400px",
  minHeight: "200px",
  maxHeight: "80vh",
  overflowY: "auto",
  backgroundColor: colorPalette.lightGray,
  boxShadow: "none",
  borderRadius: "10px",
};

const createPlaceholderMissionName = (missionType: "Patrol" | "Strike") => {
  return `${missionType === "Patrol" ? "초계" : "타격"} 임무 #${Math.floor(Math.random() * 1000)}`;
};

const getFallbackTargetId = (targets: Target[]) =>
  [...targets].sort((a, b) => a.name.localeCompare(b.name))[0]?.id ?? "";

const MissionCreatorCard = (props: MissionCreatorCardProps) => {
  const nodeRef = useRef(null);
  const initialMissionType = props.initialMissionType ?? "Patrol";
  const [selectedMissionType, setSelectedMissionType] = useState<
    "Patrol" | "Strike" // TODO: Create enum for mission types
  >(initialMissionType);
  const [selectedAircraft, setSelectedAircraft] = useState<string[]>([]);
  const prioritizedTargets = props.game.getFireRecommendationTargetPriorities(
    props.sideId,
    props.targets.map((target) => target.id)
  );
  const prioritizedTargetIndex = new Map(
    prioritizedTargets.map((entry, index) => [entry.targetId, index])
  );
  const defaultStrikeTargetId =
    prioritizedTargets[0]?.targetId ?? getFallbackTargetId(props.targets);
  const [selectedTargets, setSelectedTargets] = useState<string[]>(
    props.initialSelectedTargetIds?.length
      ? props.initialSelectedTargetIds.filter((targetId) =>
          props.targets.some((target) => target.id === targetId)
        )
      : defaultStrikeTargetId
        ? [defaultStrikeTargetId]
        : []
  );
  const [selectedReferencePoints, setSelectedReferencePoints] = useState<
    string[]
  >([]);
  const [missionName, setMissionName] = useState<string>(
    createPlaceholderMissionName(selectedMissionType)
  );
  const toastContext = useContext(ToastContext);
  const selectedTargetId = selectedTargets[0] ?? "";
  const selectedTarget =
    props.targets.find((target) => target.id === selectedTargetId) ?? null;
  const selectedRecommendation = selectedTargetId
    ? props.game.getFireRecommendationForTarget(selectedTargetId, props.sideId)
    : null;

  useEffect(() => {
    const nextMissionType = props.initialMissionType ?? "Patrol";
    setSelectedMissionType(nextMissionType);
    setMissionName(createPlaceholderMissionName(nextMissionType));

    if (nextMissionType === "Strike") {
      const nextSelectedTargets =
        props.initialSelectedTargetIds?.filter((targetId) =>
          props.targets.some((target) => target.id === targetId)
        ) ?? [];
      setSelectedTargets(
        nextSelectedTargets.length > 0
          ? nextSelectedTargets
          : defaultStrikeTargetId
            ? [defaultStrikeTargetId]
            : []
      );
      return;
    }

    setSelectedTargets(defaultStrikeTargetId ? [defaultStrikeTargetId] : []);
  }, [
    defaultStrikeTargetId,
    props.initialMissionType,
    props.initialSelectedTargetIds,
    props.targets,
  ]);

  useEffect(() => {
    if (selectedMissionType !== "Strike") {
      return;
    }

    if (
      selectedTargetId &&
      props.targets.some((target) => target.id === selectedTargetId)
    ) {
      return;
    }

    setSelectedTargets(defaultStrikeTargetId ? [defaultStrikeTargetId] : []);
  }, [
    defaultStrikeTargetId,
    props.targets,
    selectedMissionType,
    selectedTargetId,
  ]);

  const prioritizeSelectedTarget = (targetId: string) => {
    setSelectedTargets((previousTargets) => {
      const remainingTargets = previousTargets.filter((id) => id !== targetId);
      return previousTargets.includes(targetId)
        ? [targetId, ...remainingTargets]
        : [targetId, ...previousTargets];
    });
  };

  const validateMissionPropertiesInput = () => {
    if (missionName === "") {
      toastContext?.addToast("임무 이름을 입력하세요.", "error");
      return false;
    }
    if (selectedAircraft.length === 0) {
      toastContext?.addToast("최소 1개의 항공기를 선택하세요.", "error");
      return false;
    }
    if (
      selectedMissionType === "Patrol" &&
      selectedReferencePoints.length < 3
    ) {
      toastContext?.addToast(
        "초계 구역을 만들려면 참조점 3개 이상이 필요합니다.",
        "error"
      );
      return false;
    }
    if (selectedMissionType === "Strike" && selectedTargets.length === 0) {
      toastContext?.addToast("타격 목표를 1개 이상 선택하세요.", "error");
      return false;
    }
    return true;
  };

  const handleCreatePatrolMission = () => {
    if (!validateMissionPropertiesInput()) return;
    props.createPatrolMission(
      missionName,
      selectedAircraft,
      selectedReferencePoints
    );
    props.handleCloseOnMap();
  };

  const handleCreateStrikeMission = () => {
    if (!validateMissionPropertiesInput()) return;
    props.createStrikeMission(missionName, selectedAircraft, selectedTargets);
    props.handleCloseOnMap();
  };

  const handleCreateMission = () => {
    if (selectedMissionType === "Patrol") {
      handleCreatePatrolMission();
    } else if (selectedMissionType === "Strike") {
      handleCreateStrikeMission();
    }
  };

  const patrolMissionCreatorContent = (
    sortedReferencePoints: ReferencePoint[]
  ) => {
    return (
      <FormControl fullWidth sx={{ mb: 2 }}>
        <SelectField
          id="mission-creator-area-selector"
          labelId="mission-creator-area-selector-label"
          label="초계 구역"
          value={selectedReferencePoints}
          selectItems={sortedReferencePoints.map((item) => {
            return {
              name: item.name,
              value: item.id,
            };
          })}
          onChange={(value) => {
            setSelectedReferencePoints(value as string[]);
          }}
          multiple
        />
      </FormControl>
    );
  };

  const StrikeMissionCreatorContent = (sortedTargets: Target[]) => {
    return (
      <>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <SelectField
            id="mission-creator-target-selector"
            labelId="mission-creator-target-selector-label"
            label="타격 목표"
            value={selectedTargets}
            selectItems={sortedTargets.map((item) => {
              return {
                name: item.name,
                value: item.id,
              };
            })}
            onChange={(value) => {
              setSelectedTargets(value as string[]);
            }}
            multiple
          />
        </FormControl>
        <Typography sx={{ mt: -0.8, mb: 1.4, fontSize: 12, color: "text.secondary" }}>
          선택 순서의 첫 표적을 기준으로 추천과 임무 진행을 계산합니다.
        </Typography>
        <FireRecommendationPriorityList
          priorities={prioritizedTargets}
          selectedTargetId={selectedTargetId}
          onSelectTarget={prioritizeSelectedTarget}
        />
        <Box
          sx={{
            p: 1.2,
            borderRadius: 2,
            background:
              "linear-gradient(180deg, rgba(10, 26, 34, 0.95) 0%, rgba(6, 17, 22, 0.92) 100%)",
            border: "1px solid rgba(45, 214, 196, 0.16)",
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>
            선택 표적 즉시 추천
          </Typography>
          <Typography
            sx={{ mt: 0.7, fontSize: 12.5, color: "text.secondary" }}
          >
            현재 표적: {selectedTarget?.name ?? "미지정"}
          </Typography>
          <Box sx={{ mt: 0.8 }}>
            <FireRecommendationPanel
              recommendation={selectedRecommendation}
              rerankerModel={props.game.getFocusFireRerankerState().model}
              objectiveName={selectedTarget?.name}
              objectiveLatitude={selectedTarget?.latitude}
              objectiveLongitude={selectedTarget?.longitude}
            />
          </Box>
        </Box>
      </>
    );
  };

  const cardContent = () => {
    const sortedAircraft = [...props.aircraft].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    const sortedReferencePoints = [...props.referencePoints].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    const sortedTargets = [...props.targets].sort((a, b) => {
      const leftPriority = prioritizedTargetIndex.get(a.id) ?? Number.MAX_VALUE;
      const rightPriority =
        prioritizedTargetIndex.get(b.id) ?? Number.MAX_VALUE;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
      return a.name.localeCompare(b.name);
    });

    let missionSpecificComponent = null;
    if (selectedMissionType === "Patrol") {
      missionSpecificComponent = patrolMissionCreatorContent(
        sortedReferencePoints
      );
    } else if (selectedMissionType === "Strike") {
      missionSpecificComponent = StrikeMissionCreatorContent(sortedTargets);
    }

    return (
      <CardContent sx={cardContentStyle}>
        {/** Mission Type Select Field */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <SelectField
            id="mission-creator-type-selector"
            selectItems={[
              { name: "초계", value: "Patrol" },
              { name: "타격", value: "Strike" },
            ]}
            labelId="mission-creator-type-selector-label"
            label="임무 유형"
            value={selectedMissionType}
            onChange={(value) => {
              setSelectedMissionType(value as "Patrol" | "Strike");
              setMissionName(
                createPlaceholderMissionName(value as "Patrol" | "Strike")
              );
            }}
          />
        </FormControl>
        {/** Mission Name Text Field */}
        <TextField
          id="mission-name"
          label="임무 이름"
          value={missionName}
          onChange={(event) => {
            setMissionName(event.target.value);
          }}
        />
        {/** Mission Unit Select Field */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <SelectField
            id="mission-creator-unit-selector"
            labelId="mission-creator-unit-selector-label"
            label="투입 항공기"
            selectItems={sortedAircraft.map((item) => {
              return {
                name: item.name,
                value: item.id,
              };
            })}
            value={selectedAircraft}
            onChange={(value) => {
              setSelectedAircraft(value as string[]);
            }}
            multiple
          />
        </FormControl>
        {/** Mission Specific Select Fields: Patrol Or Strike */}
        {missionSpecificComponent}
        {/** Create Mission Button */}
        <Stack spacing={2} direction={"row"} sx={{ justifyContent: "center" }}>
          <Button onClick={handleCreateMission} fullWidth variant="contained">
            생성
          </Button>
        </Stack>
      </CardContent>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: "20em",
        top: "5em",
        zIndex: "1001",
      }}
    >
      <Draggable nodeRef={nodeRef}>
        <Card ref={nodeRef} sx={cardStyle}>
          <CardHeader
            sx={cardHeaderStyle}
            action={
              <IconButton
                sx={closeButtonStyle}
                onClick={props.handleCloseOnMap}
                aria-label="close"
              >
                <CloseIcon color="error" />
              </IconButton>
            }
            title={
              <Typography variant="body1" component="h1" sx={{ pl: 1 }}>
                임무 생성
              </Typography>
            }
          />
          {cardContent()}
        </Card>
      </Draggable>
    </div>
  );
};

export default MissionCreatorCard;
