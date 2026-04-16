import { useContext, useEffect, useState } from "react";
import { IconButton, Slider, Tooltip } from "@mui/material";
import Stack from "@mui/material/Stack";
import { Pause, PlayArrow, SkipNext, SkipPrevious } from "@mui/icons-material";
import { RecordingStepContext } from "@/gui/contextProviders/contexts/RecordingStepContext";

interface RecordingPlayerProps {
  recordingPaused: boolean;
  timelineStart: number;
  timelineEnd: number;
  handlePlayRecordingClick: () => void;
  handlePauseRecordingClick: () => void;
  handleStepRecordingToStep: (step: number) => void;
  handleStepRecordingBackwards: () => void;
  handleStepRecordingForwards: () => void;
  formatTimelineMark: (step: number) => string;
}

export default function RecordingPlayer(props: Readonly<RecordingPlayerProps>) {
  const [recordingPaused, setRecordingPaused] = useState<boolean>(
    props.recordingPaused
  );
  const recordingStep = useContext(RecordingStepContext);

  useEffect(() => {
    setRecordingPaused(props.recordingPaused);
  }, [props.recordingPaused]);

  const handlePlayRecordingClick = () => {
    if (recordingPaused) {
      setRecordingPaused(false);
      props.handlePlayRecordingClick();
    } else {
      setRecordingPaused(true);
      props.handlePauseRecordingClick();
    }
  };

  const handleChangeRecordingStep = (event: Event, newValue: number) => {
    setRecordingPaused(true);
    props.handlePauseRecordingClick();
    props.handleStepRecordingToStep(newValue);
  };

  const stepRecordingBackwards = () => {
    setRecordingPaused(true);
    props.handlePauseRecordingClick();
    props.handleStepRecordingBackwards();
  };

  const stepRecordingForwards = () => {
    setRecordingPaused(true);
    props.handlePauseRecordingClick();
    props.handleStepRecordingForwards();
  };

  const recordingTimelineMark = (recordingStep: number) => {
    return <>{props.formatTimelineMark(recordingStep)}</>;
  };

  return (
    <Stack
      spacing={1}
      sx={{
        mt: 0.75,
        px: 1,
        py: 1.15,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(45, 214, 196, 0.14)",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          padding: "0 1em",
        }}
      >
        <Slider
          aria-label="기록 재생 타임라인"
          value={recordingStep}
          onChange={handleChangeRecordingStep}
          min={props.timelineStart}
          max={props.timelineEnd}
          shiftStep={1}
          step={1}
          size="small"
          valueLabelDisplay="auto"
          valueLabelFormat={(recordingStep) =>
            recordingTimelineMark(recordingStep)
          }
        />
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Tooltip title={"이전 시점"}>
          <IconButton onClick={stepRecordingBackwards}>
            {<SkipPrevious />}
          </IconButton>
        </Tooltip>
        <Tooltip
          title={!recordingPaused ? "재생 일시정지" : "기록 재생"}
        >
          <IconButton onClick={handlePlayRecordingClick}>
            {!recordingPaused ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Tooltip>
        <Tooltip title={"다음 시점"}>
          <IconButton onClick={stepRecordingForwards}>
            {<SkipNext />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
