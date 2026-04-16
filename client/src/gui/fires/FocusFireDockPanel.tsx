import { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type Game from "@/game/Game";
import FireRecommendationPanel from "@/gui/fires/FireRecommendationPanel";
import { buildFocusFireInsight } from "@/gui/analysis/operationInsight";
import { ToastContext } from "@/gui/contextProviders/contexts/ToastContext";
import TextField from "@/gui/shared/ui/TextField";
import { getLocalDateTime } from "@/utils/dateTimeFunctions";
import { resolveFocusFireDockStage } from "@/gui/fires/focusFireDockState";

type FocusFireDockTab = "operations" | "recommendation" | "ai";

interface FocusFireDockPanelProps {
  game: Game;
  mobileView: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggleFocusFireMode: () => void;
  onArmObjectiveSelection: () => void;
  onClearObjective: () => void;
  onOpenAirwatch: () => void;
}

const shellStyle = {
  borderRadius: 3,
  overflow: "hidden",
  border: "1px solid rgba(45, 214, 196, 0.22)",
  background:
    "linear-gradient(180deg, rgba(8, 24, 31, 0.96) 0%, rgba(4, 13, 18, 0.98) 100%)",
  boxShadow: "0 20px 44px rgba(0, 0, 0, 0.34)",
  backdropFilter: "blur(18px)",
};

const sectionStyle = {
  p: 1.15,
  borderRadius: 2,
  backgroundColor: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(45, 214, 196, 0.12)",
};

const helperTextStyle = {
  mt: 0.55,
  fontSize: 12.5,
  color: "text.secondary",
};

const stageLabels = ["시작", "목표", "추천", "실행"] as const;

function buildSafeDownloadTimestamp() {
  return getLocalDateTime().replace(/[:.]/g, "-");
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const dataStr =
    `data:${mimeType};charset=utf-8,` + encodeURIComponent(content);
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export default function FocusFireDockPanel({
  game,
  mobileView,
  open,
  onOpen,
  onClose,
  onToggleFocusFireMode,
  onArmObjectiveSelection,
  onClearObjective,
  onOpenAirwatch,
}: Readonly<FocusFireDockPanelProps>) {
  const toastContext = useContext(ToastContext);
  const [activeTab, setActiveTab] = useState<FocusFireDockTab>("operations");
  const [desiredEffectInput, setDesiredEffectInput] = useState("");
  const [, setRevision] = useState(0);

  const focusFireSummary = game.getFocusFireSummary();
  const focusFireInsight = buildFocusFireInsight(focusFireSummary);
  const focusFireRecommendation = focusFireSummary.recommendation;
  const focusFireRerankerState = game.getFocusFireRerankerState();
  const dockStage = resolveFocusFireDockStage(focusFireSummary);
  const focusFireRecommendationTelemetry = game.getFocusFireRecommendationTelemetry(
    game.currentSideId || undefined
  );
  const focusFireFeedbackCount = focusFireRecommendationTelemetry.filter(
    (entry) => entry.feedbackOptionLabel
  ).length;
  const focusFireTrainableCount = focusFireRecommendationTelemetry.filter(
    (entry) =>
      entry.options.length >= 2 &&
      Boolean(
        entry.feedbackOptionLabel ||
          (!entry.rerankerApplied && entry.recommendedOptionLabel)
      )
  ).length;
  const focusFireFeedbackOptionLabel =
    focusFireRecommendation &&
    focusFireSummary.objectiveLatitude != null &&
    focusFireSummary.objectiveLongitude != null
      ? game.getFocusFireRecommendationFeedbackLabel(
          {
            name: focusFireSummary.objectiveName ?? "집중포격 목표",
            latitude: focusFireSummary.objectiveLatitude,
            longitude: focusFireSummary.objectiveLongitude,
          },
          game.focusFireOperation.sideId,
          focusFireRecommendation.primaryTargetId
        )
      : null;

  useEffect(() => {
    setDesiredEffectInput(
      focusFireSummary.desiredEffectOverride != null
        ? `${focusFireSummary.desiredEffectOverride}`
        : ""
    );
  }, [focusFireSummary.desiredEffectOverride]);

  useEffect(() => {
    setActiveTab(dockStage.preferredTab);
  }, [dockStage.key, dockStage.preferredTab]);

  const bumpRevision = () => {
    setRevision((previousRevision) => previousRevision + 1);
  };

  const applyDesiredEffectOverride = () => {
    if (!focusFireSummary.enabled) {
      toastContext?.addToast("집중포격 모드를 먼저 켜세요.", "error");
      return;
    }

    const trimmedValue = desiredEffectInput.trim();
    if (!trimmedValue) {
      game.setFocusFireDesiredEffectOverride(null);
      setDesiredEffectInput("");
      bumpRevision();
      toastContext?.addToast("요망 효과를 자동 산정값으로 되돌렸습니다.");
      return;
    }

    const parsedValue = Number(trimmedValue);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      toastContext?.addToast(
        "요망 효과는 0보다 큰 숫자로 입력하세요.",
        "error"
      );
      return;
    }

    const appliedValue = game.setFocusFireDesiredEffectOverride(parsedValue);
    if (appliedValue == null) {
      toastContext?.addToast(
        "요망 효과를 적용할 수 없습니다. 세력과 집중포격 상태를 확인하세요.",
        "error"
      );
      return;
    }

    setDesiredEffectInput(`${appliedValue}`);
    bumpRevision();
    toastContext?.addToast(`요망 효과 ${appliedValue.toFixed(1)}을 반영했습니다.`);
  };

  const resetDesiredEffectOverride = () => {
    game.setFocusFireDesiredEffectOverride(null);
    setDesiredEffectInput("");
    bumpRevision();
    toastContext?.addToast("요망 효과를 자동 산정값으로 전환했습니다.");
  };

  const handleRerankerToggle = () => {
    const enabled = game.setFocusFireRerankerEnabled(
      !focusFireRerankerState.enabled
    );
    bumpRevision();
    toastContext?.addToast(`AI 재정렬: ${enabled ? "켜짐" : "꺼짐"}`);
  };

  const handleRerankerTrain = () => {
    if (focusFireTrainableCount === 0) {
      toastContext?.addToast(
        "AI 학습에는 운용자 피드백 또는 규칙 기반 추천 기록이 더 필요합니다.",
        "error"
      );
      return;
    }

    const result = game.trainFocusFireRerankerModel();
    if (result.summary.recordsUsed === 0) {
      toastContext?.addToast(
        "학습 가능한 기록이 없어 모델을 업데이트하지 않았습니다.",
        "error"
      );
      return;
    }

    bumpRevision();
    toastContext?.addToast(
      `AI 재정렬 모델을 학습했습니다. 비교 ${result.summary.comparisons}건, 기록 ${result.summary.recordsUsed}건, 피드백 ${result.summary.operatorFeedbackRecords}건, 신뢰도 ${Math.round(
        game.getFocusFireRerankerState().confidenceScore * 100
      )}%.`
    );
  };

  const handleRerankerReset = () => {
    game.resetFocusFireRerankerModel();
    bumpRevision();
    toastContext?.addToast("AI 재정렬 모델을 초기화했습니다.");
  };

  const handleExportTelemetryJsonl = () => {
    const content = game.exportFocusFireRecommendationTelemetryJsonl(
      game.currentSideId || undefined
    );
    if (!content.trim()) {
      toastContext?.addToast("내보낼 추천 데이터가 없습니다.", "error");
      return;
    }

    downloadTextFile(
      `focus_fire_recommendations_${buildSafeDownloadTimestamp()}.jsonl`,
      content,
      "text/plain"
    );
    toastContext?.addToast("추천 데이터 JSONL을 내보냈습니다.");
  };

  const handleExportTelemetryCsv = () => {
    const content = game.exportFocusFireRecommendationTelemetryCsv(
      game.currentSideId || undefined
    );
    if (!content.trim()) {
      toastContext?.addToast("내보낼 추천 데이터가 없습니다.", "error");
      return;
    }

    downloadTextFile(
      `focus_fire_recommendations_${buildSafeDownloadTimestamp()}.csv`,
      content,
      "text/csv"
    );
    toastContext?.addToast("추천 데이터 CSV를 내보냈습니다.");
  };

  const handleExportModel = () => {
    const content = game.exportFocusFireRerankerModel();
    if (!content.trim()) {
      toastContext?.addToast("내보낼 AI 모델이 없습니다.", "error");
      return;
    }

    downloadTextFile(
      `focus_fire_reranker_model_${buildSafeDownloadTimestamp()}.json`,
      content,
      "application/json"
    );
    toastContext?.addToast("집중포격 AI 모델 JSON을 내보냈습니다.");
  };

  const handleImportModel = () => {
    const input = document.createElement("input");
    input.style.display = "none";
    input.type = "file";
    input.accept = ".json";
    input.onchange = (event) => {
      input.remove();
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = (readerEvent) => {
        try {
          const modelJson = readerEvent.target?.result as string;
          const result = game.importFocusFireRerankerModel(modelJson);
          bumpRevision();
          toastContext?.addToast(
            `AI 모델 v${result.model.version} (${result.model.source})을 불러왔습니다.`,
            "success"
          );
        } catch (_error) {
          toastContext?.addToast(
            "AI 모델 JSON 형식이 올바르지 않아 불러오지 못했습니다.",
            "error"
          );
        }
      };
      reader.onerror = () => {
        reader.abort();
        toastContext?.addToast("AI 모델 파일을 읽지 못했습니다.", "error");
      };
    };
    input.click();
  };

  const handleRecordFeedback = (optionLabel: string) => {
    if (
      !focusFireRecommendation ||
      focusFireSummary.objectiveLatitude == null ||
      focusFireSummary.objectiveLongitude == null
    ) {
      toastContext?.addToast(
        "현재 추천안이 없어 피드백을 기록할 수 없습니다.",
        "error"
      );
      return;
    }

    const record = game.setFocusFireRecommendationFeedback(
      optionLabel,
      {
        name: focusFireSummary.objectiveName ?? "집중포격 목표",
        latitude: focusFireSummary.objectiveLatitude,
        longitude: focusFireSummary.objectiveLongitude,
      },
      game.focusFireOperation.sideId,
      focusFireRecommendation
    );
    if (!record) {
      toastContext?.addToast("피드백 기록에 실패했습니다.", "error");
      return;
    }

    bumpRevision();
    toastContext?.addToast(
      `${optionLabel}을(를) 운용자 학습 기준으로 기록했습니다.`
    );
  };

  const handleStageAction = () => {
    switch (dockStage.action) {
      case "enable":
        onToggleFocusFireMode();
        break;
      case "objective":
        onArmObjectiveSelection();
        break;
      case "recommendation":
        setActiveTab("recommendation");
        break;
      case "airwatch":
        onOpenAirwatch();
        break;
    }
  };

  const renderMetricTile = (
    label: string,
    value: string,
    accent: "neutral" | "strong" = "neutral"
  ) => (
    <Box
      sx={{
        minWidth: 0,
        flex: "1 1 90px",
        p: 1,
        borderRadius: 1.7,
        backgroundColor:
          accent === "strong"
            ? "rgba(45, 214, 196, 0.1)"
            : "rgba(255,255,255,0.035)",
        border:
          accent === "strong"
            ? "1px solid rgba(45, 214, 196, 0.26)"
            : "1px solid rgba(45, 214, 196, 0.1)",
      }}
    >
      <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.35, fontSize: 14, fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );

  const renderStageRail = () => (
    <Stack direction="row" spacing={0.7} sx={{ mt: 1.15 }}>
      {stageLabels.map((label, index) => {
        const stepNumber = index + 1;
        const currentStep = dockStage.step === stepNumber;
        const completedStep = dockStage.step > stepNumber;

        return (
          <Box
            key={label}
            sx={{
              flex: 1,
              minWidth: 0,
              px: 0.75,
              py: 0.7,
              borderRadius: 1.5,
              backgroundColor: currentStep
                ? "rgba(45, 214, 196, 0.16)"
                : completedStep
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.03)",
              border: currentStep
                ? "1px solid rgba(45, 214, 196, 0.28)"
                : "1px solid rgba(45, 214, 196, 0.08)",
            }}
          >
            <Typography
              sx={{
                fontSize: 10.5,
                color: currentStep ? "#9ef7ec" : "text.secondary",
                letterSpacing: "0.08em",
              }}
            >
              STEP {stepNumber}
            </Typography>
            <Typography
              sx={{
                mt: 0.2,
                fontSize: 12.5,
                fontWeight: currentStep ? 700 : 500,
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );

  const renderOperationsTab = () => (
    <Stack spacing={1}>
      <Box sx={sectionStyle}>
        <Stack direction="row" spacing={0.8} sx={{ flexWrap: "wrap" }}>
          <Chip
            size="small"
            color={focusFireSummary.active ? "warning" : "default"}
            label={focusFireSummary.statusLabel}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`충격량 ${focusFireInsight.shockIndex}`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`점령 ${focusFireSummary.captureProgress.toFixed(0)}%`}
          />
        </Stack>
        <Typography sx={{ mt: 0.9, fontSize: 12.5, fontWeight: 700 }}>
          목표: {focusFireSummary.objectiveName ?? "미지정"}
        </Typography>
        <Typography sx={helperTextStyle}>
          포대 {focusFireSummary.artilleryCount} / 기갑{" "}
          {focusFireSummary.armorCount} / 항공 {focusFireSummary.aircraftCount} /
          탄체 {focusFireSummary.weaponsInFlight}
        </Typography>
        <Typography sx={helperTextStyle}>
          주도 축: {focusFireInsight.dominantAxis} · {focusFireInsight.summary}
        </Typography>
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ mt: 1, flexWrap: "wrap" }}
        >
          {renderMetricTile("포대", `${focusFireSummary.artilleryCount}`)}
          {renderMetricTile("기갑", `${focusFireSummary.armorCount}`)}
          {renderMetricTile("항공", `${focusFireSummary.aircraftCount}`)}
          {renderMetricTile(
            "비행 중 탄체",
            `${focusFireSummary.weaponsInFlight}`,
            focusFireSummary.weaponsInFlight > 0 ? "strong" : "neutral"
          )}
        </Stack>
      </Box>

      <Box sx={sectionStyle}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
          요망 효과
        </Typography>
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ mt: 0.9, alignItems: "flex-start", flexWrap: "wrap" }}
        >
          <TextField
            id="focus-fire-dock-desired-effect-input"
            size="small"
            type="number"
            label="요망 효과 입력"
            value={desiredEffectInput}
            onChange={(event) => setDesiredEffectInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyDesiredEffectOverride();
              }
            }}
            inputProps={{ min: 0.1, step: 0.1 }}
            disabled={!focusFireSummary.enabled}
            sx={{
              mb: 0,
              minWidth: mobileView ? "100%" : 150,
              flex: 1,
              bgcolor: "rgba(255,255,255,0.04)",
            }}
          />
          <Button
            size="small"
            variant="contained"
            onClick={applyDesiredEffectOverride}
            disabled={!focusFireSummary.enabled}
          >
            반영
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={resetDesiredEffectOverride}
            disabled={
              !focusFireSummary.enabled &&
              focusFireSummary.desiredEffectOverride == null
            }
          >
            자동
          </Button>
        </Stack>
        <Typography sx={helperTextStyle}>
          자동 산정값:{" "}
          {focusFireRecommendation
            ? focusFireRecommendation.desiredEffectEstimated.toFixed(1)
            : "산출 대기"}{" "}
          · 현재 기준:{" "}
          {focusFireRecommendation?.desiredEffectIsUserDefined
            ? "사용자 입력"
            : "자동 산정"}
        </Typography>
      </Box>

      <Box sx={sectionStyle}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
          전술 조작
        </Typography>
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ mt: 0.9, flexWrap: "wrap" }}
        >
          <Button
            size="small"
            variant={focusFireSummary.enabled ? "outlined" : "contained"}
            onClick={onToggleFocusFireMode}
          >
            {focusFireSummary.enabled ? "모드 해제" : "모드 켜기"}
          </Button>
          <Button size="small" variant="outlined" onClick={onArmObjectiveSelection}>
            목표 지정
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={onOpenAirwatch}
            disabled={!focusFireSummary.objectiveName}
          >
            공중 관측 3D
          </Button>
          <Button
            size="small"
            variant="text"
            color="error"
            onClick={onClearObjective}
            disabled={!focusFireSummary.enabled && !focusFireSummary.objectiveName}
          >
            초기화
          </Button>
        </Stack>
      </Box>
    </Stack>
  );

  const renderRecommendationTab = () => (
    <Stack spacing={1}>
      <Box sx={sectionStyle}>
        <Stack direction="row" spacing={0.8} sx={{ flexWrap: "wrap" }}>
          <Chip
            size="small"
            color={focusFireRecommendation ? "success" : "default"}
            label={focusFireRecommendation ? "권장안 준비" : "분석 대기"}
          />
          {focusFireRecommendation?.recommendedOptionLabel && (
            <Chip
              size="small"
              variant="outlined"
              label={focusFireRecommendation.recommendedOptionLabel}
            />
          )}
          {focusFireRecommendation?.selectionModelLabel && (
            <Chip
              size="small"
              variant="outlined"
              label={focusFireRecommendation.selectionModelLabel}
            />
          )}
        </Stack>
        <Typography sx={helperTextStyle}>
          목표 {focusFireSummary.objectiveName ?? "미지정"} · 학습 기준{" "}
          {focusFireFeedbackOptionLabel ?? "미지정"}
        </Typography>
        {focusFireRecommendation && (
          <Stack
            direction="row"
            spacing={0.8}
            sx={{ mt: 1, flexWrap: "wrap" }}
          >
            {renderMetricTile(
              "예상 효과",
              focusFireRecommendation.expectedStrikeEffect.toFixed(2),
              "strong"
            )}
            {renderMetricTile(
              "발사 ETA",
              focusFireRecommendation.averageTimeToFireSeconds == null
                ? "산출 불가"
                : `${Math.round(focusFireRecommendation.averageTimeToFireSeconds)}초`
            )}
            {renderMetricTile(
              "위협 노출",
              focusFireRecommendation.threatExposureScore == null
                ? "산출 불가"
                : focusFireRecommendation.threatExposureScore.toFixed(1)
            )}
          </Stack>
        )}
      </Box>

      <Box sx={sectionStyle}>
        <FireRecommendationPanel
          recommendation={focusFireRecommendation}
          objectiveName={focusFireSummary.objectiveName}
          objectiveLatitude={focusFireSummary.objectiveLatitude}
          objectiveLongitude={focusFireSummary.objectiveLongitude}
          feedbackOptionLabel={focusFireFeedbackOptionLabel}
          onRecordFeedback={handleRecordFeedback}
        />
      </Box>
    </Stack>
  );

  const renderAiTab = () => (
    <Stack spacing={1}>
      <Box sx={sectionStyle}>
        <Stack direction="row" spacing={0.8} sx={{ flexWrap: "wrap" }}>
          <Chip
            size="small"
            color={focusFireRerankerState.enabled ? "success" : "default"}
            label={
              focusFireRerankerState.enabled ? "AI 재정렬 ON" : "AI 재정렬 OFF"
            }
          />
          <Chip
            size="small"
            variant="outlined"
            label={`모델 ${focusFireRerankerState.model.source}`}
          />
        </Stack>
        <Typography sx={helperTextStyle}>
          모델{" "}
          {focusFireRerankerState.model.modelFamily === "tree-ensemble"
            ? "트리"
            : "선형"}{" "}
          / {focusFireRerankerState.model.source} · v
          {focusFireRerankerState.model.version} · 표본{" "}
          {focusFireRerankerState.model.sampleCount}
        </Typography>
        <Typography sx={helperTextStyle}>
          운용자 {focusFireRerankerState.model.operatorFeedbackCount} / 규칙{" "}
          {focusFireRerankerState.model.ruleSeedCount}
        </Typography>
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ mt: 1, flexWrap: "wrap" }}
        >
          {renderMetricTile(
            "데이터",
            `${focusFireRecommendationTelemetry.length}건`
          )}
          {renderMetricTile("피드백", `${focusFireFeedbackCount}건`)}
          {renderMetricTile(
            "학습 가능",
            `${focusFireTrainableCount}건`,
            focusFireTrainableCount > 0 ? "strong" : "neutral"
          )}
          {renderMetricTile(
            "신뢰도",
            `${Math.round(focusFireRerankerState.confidenceScore * 100)}%`,
            focusFireRerankerState.confidenceScore >= 0.5 ? "strong" : "neutral"
          )}
        </Stack>
      </Box>

      <Box sx={sectionStyle}>
        <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
          AI 제어
        </Typography>
        <Stack
          direction="row"
          spacing={0.8}
          sx={{ mt: 0.9, flexWrap: "wrap" }}
        >
          <Button size="small" variant="contained" onClick={handleRerankerToggle}>
            {focusFireRerankerState.enabled ? "AI 끄기" : "AI 켜기"}
          </Button>
          <Button size="small" variant="outlined" onClick={handleRerankerTrain}>
            AI 학습
          </Button>
          <Button size="small" variant="text" onClick={handleRerankerReset}>
            AI 초기화
          </Button>
        </Stack>
        <Divider sx={{ my: 1.1 }} />
        <Stack direction="row" spacing={0.8} sx={{ flexWrap: "wrap" }}>
          <Button size="small" variant="outlined" onClick={handleExportModel}>
            모델 JSON
          </Button>
          <Button size="small" variant="outlined" onClick={handleImportModel}>
            모델 불러오기
          </Button>
          <Button size="small" variant="outlined" onClick={handleExportTelemetryJsonl}>
            JSONL
          </Button>
          <Button size="small" variant="outlined" onClick={handleExportTelemetryCsv}>
            CSV
          </Button>
        </Stack>
      </Box>
    </Stack>
  );

  if (!open) {
    return (
      <Box
        sx={{
          ...shellStyle,
          width: mobileView ? "100%" : 320,
          alignSelf: mobileView ? "stretch" : "flex-end",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 1.2 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
              sx={{ flexWrap: "wrap" }}
            >
              <Typography sx={{ fontWeight: 700 }}>집중포격 작전</Typography>
              <Chip size="small" variant="outlined" label={`STEP ${dockStage.step}`} />
            </Stack>
            <Typography
              sx={{ mt: 0.45, fontSize: 13, fontWeight: 700, color: "var(--fs-text)" }}
            >
              {dockStage.title}
            </Typography>
            <Typography
              sx={{ mt: 0.3, fontSize: 12.5, color: "text.secondary" }}
            >
              {dockStage.description}
            </Typography>
            <Box
              sx={{
                mt: 0.8,
                height: 6,
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${dockStage.progress}%`,
                  height: "100%",
                  borderRadius: 999,
                  background:
                    "linear-gradient(90deg, rgba(45,214,196,0.88) 0%, rgba(117,248,225,0.95) 100%)",
                }}
              />
            </Box>
          </Box>
          <Button size="small" variant="contained" onClick={onOpen}>
            열기
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ...shellStyle,
        width: mobileView ? "100%" : 400,
        maxWidth: "100%",
        alignSelf: mobileView ? "stretch" : "flex-end",
      }}
    >
      <Box
        sx={{
          px: 1.3,
          py: 1.1,
          background:
            "linear-gradient(180deg, rgba(13, 40, 48, 0.98) 0%, rgba(8, 25, 31, 0.96) 100%)",
          borderBottom: "1px solid rgba(45, 214, 196, 0.16)",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ display: "block", lineHeight: 1, letterSpacing: "0.14em" }}
            >
              FOCUS FIRE
            </Typography>
            <Typography sx={{ mt: 0.55, fontWeight: 700, fontSize: 16 }}>
              집중포격 작전 패널
            </Typography>
            <Typography sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}>
              {focusFireSummary.objectiveName ?? "목표 미지정"} ·{" "}
              {focusFireSummary.statusLabel}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="집중포격 패널 닫기">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={0.8} sx={{ mt: 1, flexWrap: "wrap" }}>
          <Chip
            size="small"
            color={focusFireSummary.active ? "warning" : "default"}
            label={focusFireSummary.active ? "집중 진행" : "정렬 중"}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`충격량 ${focusFireInsight.shockIndex}`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`점령 ${focusFireSummary.captureProgress.toFixed(0)}%`}
          />
        </Stack>
        {renderStageRail()}
        <Box
          sx={{
            mt: 1,
            p: 1.05,
            borderRadius: 2,
            background:
              "linear-gradient(180deg, rgba(18, 52, 61, 0.98) 0%, rgba(10, 31, 37, 0.96) 100%)",
            border: "1px solid rgba(45, 214, 196, 0.22)",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ flexWrap: "wrap" }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{ fontSize: 11.5, letterSpacing: "0.08em", color: "#8deee2" }}
              >
                지금 할 일
              </Typography>
              <Typography sx={{ mt: 0.3, fontSize: 14, fontWeight: 700 }}>
                {dockStage.title}
              </Typography>
              <Typography sx={{ mt: 0.3, fontSize: 12.5, color: "text.secondary" }}>
                {dockStage.description}
              </Typography>
            </Box>
            <Button size="small" variant="contained" onClick={handleStageAction}>
              {dockStage.actionLabel}
            </Button>
          </Stack>
          <Box
            sx={{
              mt: 0.9,
              height: 6,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${dockStage.progress}%`,
                height: "100%",
                borderRadius: 999,
                background:
                  "linear-gradient(90deg, rgba(45,214,196,0.9) 0%, rgba(117,248,225,0.98) 100%)",
              }}
            />
          </Box>
        </Box>
      </Box>

      <Stack
        direction="row"
        spacing={0.8}
        sx={{ px: 1.2, pt: 1.05, pb: 0.5, flexWrap: "wrap" }}
      >
        <Button
          size="small"
          variant={activeTab === "operations" ? "contained" : "outlined"}
          onClick={() => setActiveTab("operations")}
        >
          작전
        </Button>
        <Button
          size="small"
          variant={activeTab === "recommendation" ? "contained" : "outlined"}
          onClick={() => setActiveTab("recommendation")}
        >
          추천
        </Button>
        <Button
          size="small"
          variant={activeTab === "ai" ? "contained" : "outlined"}
          onClick={() => setActiveTab("ai")}
        >
          AI
        </Button>
      </Stack>

      <Box
        sx={{
          px: 1.2,
          pb: 1.2,
          maxHeight: mobileView ? "46vh" : "54vh",
          overflowY: "auto",
        }}
      >
        {activeTab === "operations" && renderOperationsTab()}
        {activeTab === "recommendation" && renderRecommendationTab()}
        {activeTab === "ai" && renderAiTab()}
      </Box>
    </Box>
  );
}
