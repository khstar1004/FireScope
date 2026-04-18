import React, { useEffect, useState, useContext } from "react";
import Draggable from "react-draggable";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import { colorPalette } from "@/utils/constants";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CardContent,
  FormControl,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import PatrolMission from "@/game/mission/PatrolMission";
import Aircraft from "@/game/units/Aircraft";
import ReferencePoint from "@/game/units/ReferencePoint";
import StrikeMission from "@/game/mission/StrikeMission";
import { Target } from "@/game/engine/weaponEngagement";
import SelectField from "@/gui/shared/ui/SelectField";
import TextField from "@/gui/shared/ui/TextField";
import Game, { Mission } from "@/game/Game";
import { ToastContext } from "@/gui/contextProviders/contexts/ToastContext";
import FireRecommendationPanel, {
  FireRecommendationPriorityList,
} from "@/gui/fires/FireRecommendationPanel";

interface MissionEditorCardProps {
  game: Game;
  sideId: string;
  missions: Mission[];
  selectedMissionId: string;
  aircraft: Aircraft[];
  referencePoints: ReferencePoint[];
  targets: Target[];
  updatePatrolMission: (
    missionId: string,
    missionName: string,
    assignedUnits: string[],
    referencePoints: string[]
  ) => void;
  updateStrikeMission: (
    missionId: string,
    missionName: string,
    assignedUnits: string[],
    targetIds: string[]
  ) => void;
  deleteMission: (missionId: string) => void;
  handleCloseOnMap: () => void;
}

const missionTypes = ["Patrol", "Strike"];

const cardContentStyle = {
  display: "flex",
  flexDirection: "column",
  rowGap: "10px",
};

const closeButtonStyle = {
  bottom: 5.5,
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

const cardHeaderStyle = {
  backgroundColor: colorPalette.white,
  color: "var(--fs-text)",
  height: "50px",
};

const bottomButtonsStackStyle = {
  display: "flex",
  justifyContent: "center",
};

const editorButtonStyle = {
  color: "#031114",
};

const parseSelectedMissionType = (selectedMission: Mission): string => {
  return selectedMission instanceof PatrolMission ? "Patrol" : "Strike";
};

const MissionEditorCard = (props: MissionEditorCardProps) => {
  const nodeRef = React.useRef(null);
  const [selectedMission, setSelectedMission] = useState<Mission>(
    props.missions.find((mission) => mission.id === props.selectedMissionId) ||
      props.missions[0]
  );
  const [selectedMissionType, setSelectedMissionType] = useState<string>(
    parseSelectedMissionType(selectedMission)
  );
  const [selectedAircraft, setSelectedAircraft] = useState<string[]>(
    selectedMission.assignedUnitIds
  );
  const [selectedReferencePoints, setSelectedReferencePoints] = useState<
    string[]
  >(
    selectedMission instanceof PatrolMission
      ? selectedMission.assignedArea.map((point) => point.id)
      : []
  );
  const [selectedTargets, setSelectedTargets] = useState<string[]>(
    selectedMission instanceof StrikeMission
      ? selectedMission.assignedTargetIds
      : []
  );
  const [missionName, setMissionName] = useState<string>(selectedMission.name);
  const toastContext = useContext(ToastContext);
  const prioritizedTargets = props.game.getFireRecommendationTargetPriorities(
    props.sideId,
    props.targets.map((target) => target.id)
  );
  const prioritizedTargetIndex = new Map(
    prioritizedTargets.map((entry, index) => [entry.targetId, index])
  );
  const selectedTargetId = selectedTargets[0] ?? "";
  const selectedTarget =
    props.targets.find((target) => target.id === selectedTargetId) ?? null;
  const selectedRecommendation =
    selectedMissionType === "Strike" && selectedTargetId
      ? props.game.getFireRecommendationForTarget(selectedTargetId, props.sideId)
      : null;

  useEffect(() => {
    const newSelectedMission =
      props.missions.find(
        (mission) => mission.id === props.selectedMissionId
      ) || props.missions[0];

    if (newSelectedMission) {
      setSelectedMission(newSelectedMission);
      setMissionName(newSelectedMission.name);
      setSelectedAircraft(newSelectedMission.assignedUnitIds);

      if (newSelectedMission instanceof PatrolMission) {
        setSelectedReferencePoints(
          newSelectedMission.assignedArea.map((point) => point.id)
        );
        setSelectedTargets([]);
      } else if (newSelectedMission instanceof StrikeMission) {
        setSelectedTargets(newSelectedMission.assignedTargetIds);
        setSelectedReferencePoints([]);
      }

      setSelectedMissionType(parseSelectedMissionType(newSelectedMission));
    }
  }, [props.selectedMissionId, props.missions]);

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

    const defaultTargetId =
      prioritizedTargets[0]?.targetId ??
      [...props.targets].sort((a, b) => a.name.localeCompare(b.name))[0]?.id ??
      "";
    setSelectedTargets(defaultTargetId ? [defaultTargetId] : []);
  }, [
    prioritizedTargets,
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
      selectedMission instanceof PatrolMission &&
      selectedReferencePoints.length < 3
    ) {
      toastContext?.addToast(
        "초계 구역을 만들려면 참조점 3개 이상이 필요합니다.",
        "error"
      );
      return false;
    }
    if (
      selectedMission instanceof StrikeMission &&
      selectedTargets.length === 0
    ) {
      toastContext?.addToast("타격 목표를 1개 이상 선택하세요.", "error");
      return false;
    }
    return true;
  };

  const handleDeleteMission = () => {
    props.deleteMission(selectedMission.id);
    props.handleCloseOnMap();
  };

  const handleUpdateMission = () => {
    if (!validateMissionPropertiesInput()) return;
    if (selectedMissionType === "Patrol") {
      props.updatePatrolMission(
        selectedMission.id,
        missionName,
        selectedAircraft,
        selectedReferencePoints
      );
    } else if (selectedMissionType === "Strike") {
      props.updateStrikeMission(
        selectedMission.id,
        missionName,
        selectedAircraft,
        selectedTargets
      );
    }
    props.handleCloseOnMap();
  };

  const handleClose = () => {
    props.handleCloseOnMap();
  };

  const handleMissionChange = (newSelectedMission: string) => {
    const searchedSelectedMission = props.missions.find(
      (mission) => mission.id === newSelectedMission
    );

    if (!searchedSelectedMission) return;

    setSelectedMission(searchedSelectedMission);
    setMissionName(searchedSelectedMission.name);
    setSelectedAircraft(searchedSelectedMission.assignedUnitIds);

    if (searchedSelectedMission instanceof PatrolMission) {
      setSelectedReferencePoints(
        searchedSelectedMission.assignedArea.map((point) => point.id)
      );
    } else if (searchedSelectedMission instanceof StrikeMission) {
      setSelectedTargets(searchedSelectedMission.assignedTargetIds);
    }

    setSelectedMissionType(parseSelectedMissionType(searchedSelectedMission));
  };

  const patrolMissionEditorContent = (
    sortedReferencePoints: ReferencePoint[]
  ) => {
    return (
      <FormControl fullWidth sx={{ mb: 2 }}>
        <SelectField
          id="mission-editor-area-selector"
          labelId="mission-editor-area-selector-label"
          label="초계 구역"
          selectItems={sortedReferencePoints.map((item) => {
            return {
              name: item.name,
              value: item.id,
            };
          })}
          value={selectedReferencePoints}
          onChange={(value) => {
            setSelectedReferencePoints(value as string[]);
          }}
          multiple
        />
      </FormControl>
    );
  };

  const StrikeMissionEditorContent = (sortedTargets: Target[]) => {
    return (
      <>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <SelectField
            id="mission-editor-target-selector"
            labelId="mission-editor-target-selector-label"
            label="타격 목표"
            selectItems={sortedTargets.map((item) => {
              return {
                name: item.name,
                value: item.id,
              };
            })}
            value={selectedTargets}
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
    const missionIds = props.missions.map((mission) => mission.id);
    const missionNames = props.missions.map((mission) => mission.name);
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
      missionSpecificComponent = patrolMissionEditorContent(
        sortedReferencePoints
      );
    } else if (selectedMissionType === "Strike") {
      missionSpecificComponent = StrikeMissionEditorContent(sortedTargets);
    }

    return (
      <CardContent sx={cardContentStyle}>
        {/** Missions Select Field */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <SelectField
            id="mission-editor-mission-selector"
            label="임무"
            labelId="mission-editor-mission-selector-label"
            selectItems={missionNames.map((item, index) => {
              return {
                name: item,
                value: missionIds[index],
              };
            })}
            value={selectedMission.id}
            onChange={(value) => {
              handleMissionChange(value as string);
            }}
          />
        </FormControl>
        {/** Mission Type Select Field */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <SelectField
            id="mission-editor-type-selector"
            label="유형"
            labelId="mission-editor-type-selector-label"
            selectItems={missionTypes.map((item) => {
              return {
                name: item === "Patrol" ? "초계" : "타격",
                value: item,
              };
            })}
            value={selectedMissionType}
            onChange={() => {}}
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
            id="mission-editor-unit-selector"
            label="투입 항공기"
            labelId="mission-editor-unit-selector-label"
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
        {/* Form Action/Buttons */}
        <Stack sx={bottomButtonsStackStyle} direction="row" spacing={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleUpdateMission}
            sx={editorButtonStyle}
          >
            저장
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleDeleteMission}
            sx={editorButtonStyle}
          >
            삭제
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
                type="button"
                sx={closeButtonStyle}
                onClick={handleClose}
                aria-label="close"
              >
                <CloseIcon color="error" />
              </IconButton>
            }
            title={
              <Typography variant="body1" component="h1" sx={{ pl: 1 }}>
                임무 편집
              </Typography>
            }
          />
          {cardContent()}
        </Card>
      </Draggable>
    </div>
  );
};

export default MissionEditorCard;
