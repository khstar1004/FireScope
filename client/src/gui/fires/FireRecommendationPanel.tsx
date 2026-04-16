import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import type {
  FireRecommendationTargetPriority,
  FocusFireRecommendation,
} from "@/game/Game";
import { getDisplayName } from "@/utils/koreanCatalog";

interface FireRecommendationPanelProps {
  recommendation: FocusFireRecommendation | null;
  objectiveName?: string | null;
  objectiveLatitude?: number | null;
  objectiveLongitude?: number | null;
  feedbackOptionLabel?: string | null;
  onRecordFeedback?: (optionLabel: string) => void;
}

interface FireRecommendationPriorityListProps {
  priorities: FireRecommendationTargetPriority[];
  selectedTargetId?: string | null;
  onSelectTarget?: (targetId: string) => void;
}

function formatFireRecommendationLauncherSummary(launcherNames: string[]) {
  if (launcherNames.length === 0) {
    return "가용 발포 부대 없음";
  }
  if (launcherNames.length <= 2) {
    return launcherNames.join(", ");
  }
  return `${launcherNames.slice(0, 2).join(", ")} 외 ${
    launcherNames.length - 2
  }개`;
}

function formatFireRecommendationLocation(
  latitude: number | null | undefined,
  longitude: number | null | undefined
) {
  if (latitude == null || longitude == null) {
    return "미지정";
  }
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function formatFireRecommendationDistance(
  recommendation: FocusFireRecommendation | null
) {
  if (!recommendation || recommendation.targetDistanceKm == null) {
    return "산출 불가";
  }

  const minimumDistanceKm = recommendation.minimumTargetDistanceKm;
  const maximumDistanceKm = recommendation.maximumTargetDistanceKm;
  if (minimumDistanceKm == null || maximumDistanceKm == null) {
    return `${recommendation.targetDistanceKm.toFixed(1)}km`;
  }
  if (Math.abs(maximumDistanceKm - minimumDistanceKm) < 0.2) {
    return `${recommendation.targetDistanceKm.toFixed(1)}km`;
  }
  return `${minimumDistanceKm.toFixed(1)}~${maximumDistanceKm.toFixed(1)}km`;
}

function formatFireRecommendationTargetComposition(
  recommendation: FocusFireRecommendation | null
) {
  if (!recommendation || recommendation.targetComposition.length === 0) {
    return "주변 적 표적 분석 없음";
  }

  return recommendation.targetComposition
    .map(
      (entry) => `${entry.label} ${entry.count}개(전투력 ${entry.combatPower})`
    )
    .join(" / ");
}

function formatFireRecommendationEffectCoverage(
  recommendation: FocusFireRecommendation | null
) {
  if (!recommendation || recommendation.desiredEffect <= 0) {
    return "산출 불가";
  }

  return `${Math.round(
    (recommendation.expectedStrikeEffect / recommendation.desiredEffect) * 100
  )}%`;
}

function formatFireRecommendationEta(seconds: number | null | undefined) {
  if (seconds == null || !Number.isFinite(seconds)) {
    return "산출 불가";
  }
  if (seconds < 1) {
    return "즉시";
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}초`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (remainingSeconds === 0) {
    return `${minutes}분`;
  }
  return `${minutes}분 ${remainingSeconds}초`;
}

function formatFireRecommendationThreatExposure(
  threatExposureScore: number | null | undefined
) {
  if (threatExposureScore == null || !Number.isFinite(threatExposureScore)) {
    return "산출 불가";
  }
  if (threatExposureScore >= 4.5) {
    return `높음 (${threatExposureScore.toFixed(1)})`;
  }
  if (threatExposureScore >= 2) {
    return `보통 (${threatExposureScore.toFixed(1)})`;
  }
  return `낮음 (${threatExposureScore.toFixed(1)})`;
}

export function FireRecommendationPriorityList({
  priorities,
  selectedTargetId,
  onSelectTarget,
}: Readonly<FireRecommendationPriorityListProps>) {
  if (priorities.length === 0) {
    return null;
  }

  return (
    <>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
        자동 우선순위 추천
      </Typography>
      <Stack spacing={0.7} sx={{ mt: 0.6 }}>
        {priorities.slice(0, 3).map((entry) => {
          const isSelected = entry.targetId === selectedTargetId;

          return (
            <Box
              key={entry.targetId}
              sx={{
                p: 0.9,
                borderRadius: 1.5,
                backgroundColor: isSelected
                  ? "rgba(45, 214, 196, 0.12)"
                  : "rgba(255,255,255,0.04)",
                border: "1px solid rgba(45, 214, 196, 0.14)",
              }}
            >
              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
                justifyContent="space-between"
                sx={{ flexWrap: "wrap" }}
              >
                <Stack direction="row" spacing={0.8} sx={{ flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                    {entry.priorityRank}순위
                  </Typography>
                  <Chip
                    size="small"
                    variant={isSelected ? "filled" : "outlined"}
                    label={`점수 ${entry.priorityScore.toFixed(1)}`}
                  />
                </Stack>
                {onSelectTarget && (
                  <Button
                    size="small"
                    variant={isSelected ? "contained" : "text"}
                    onClick={() => onSelectTarget(entry.targetId)}
                  >
                    {isSelected ? "선택됨" : "선택"}
                  </Button>
                )}
              </Stack>
              <Typography sx={{ mt: 0.45, fontSize: 12.5, fontWeight: 700 }}>
                {entry.targetName}
              </Typography>
              <Typography
                sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}
              >
                {entry.targetSideName} ·{" "}
                {getDisplayName(entry.targetClassName || entry.targetName)} ·{" "}
                {entry.recommendation.targetPriorityLabel}
              </Typography>
              <Typography
                sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}
              >
                {entry.recommendation.missionKind} ·{" "}
                {entry.recommendation.ammoType ?? "추천 없음"} · 예상효과{" "}
                {entry.recommendation.expectedStrikeEffect.toFixed(2)}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </>
  );
}

export default function FireRecommendationPanel({
  recommendation,
  objectiveName,
  objectiveLatitude,
  objectiveLongitude,
  feedbackOptionLabel,
  onRecordFeedback,
}: Readonly<FireRecommendationPanelProps>) {
  const topOption = recommendation?.options[0];

  if (!recommendation) {
    return (
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        추천 가능한 표적 또는 가용 화력이 없습니다.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.45}>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        발포 부대:{" "}
        {formatFireRecommendationLauncherSummary(
          recommendation.firingUnitNames ?? []
        )}
      </Typography>
      <Divider sx={{ my: 0.8 }} />
      <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
        임무 정보
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        임무 유형: {recommendation.missionKind}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        공격표적: {recommendation.targetName ?? objectiveName ?? "미지정"}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        적 세력:{" "}
        {recommendation.targetSideNames.length
          ? recommendation.targetSideNames.join(", ")
          : "분석 없음"}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        표적 구성: {formatFireRecommendationTargetComposition(recommendation)}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        표적 전투력: {recommendation.targetCombatPower}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        표적 우선순위: {recommendation.targetPriorityLabel}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        요망 효과(추정): {recommendation.desiredEffect.toFixed(1)}
        {recommendation.desiredEffectLabel
          ? ` · ${recommendation.desiredEffectLabel}`
          : ""}
        {recommendation.desiredEffectIsUserDefined
          ? " · 수동 입력"
          : " · 자동 산정"}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        표적 위치:{" "}
        {formatFireRecommendationLocation(
          recommendation.targetLatitude ?? objectiveLatitude,
          recommendation.targetLongitude ?? objectiveLongitude
        )}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        표적 거리: {formatFireRecommendationDistance(recommendation)}
      </Typography>

      <Typography sx={{ mt: 1.1, fontSize: 12.5, fontWeight: 700 }}>
        화력 추천 정보
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        기준안: {recommendation.recommendedOptionLabel ?? "추천 없음"}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        탄종: {recommendation.ammoType ?? "추천 없음"}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        무장체계: {recommendation.weaponName ?? "추천 없음"}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        발수: {recommendation.shotCount}발
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        예상타격효과: {recommendation.expectedStrikeEffect.toFixed(2)}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        효과 충족도: {formatFireRecommendationEffectCoverage(recommendation)}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        발사 준비도: {recommendation.launchReadinessLabel}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        선택 모델: {recommendation.selectionModelLabel}
      </Typography>
      {topOption?.aiReasonSummary && (
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
          AI 판단: {topOption.aiReasonSummary}
        </Typography>
      )}
      {topOption?.aiPositiveSignals &&
        topOption.aiPositiveSignals.length > 0 && (
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
            강점: {topOption.aiPositiveSignals.join(" / ")}
          </Typography>
        )}
      {topOption?.aiNegativeSignals &&
        topOption.aiNegativeSignals.length > 0 && (
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
            주의: {topOption.aiNegativeSignals.join(" / ")}
          </Typography>
        )}
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        학습 기준: {feedbackOptionLabel ?? "미지정"}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        즉시 발사 {recommendation.immediateLaunchReadyCount}개 · 기동 필요{" "}
        {recommendation.repositionRequiredCount}개 · 차단{" "}
        {recommendation.blockedLauncherCount}개
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        예상 발사 ETA:{" "}
        {formatFireRecommendationEta(recommendation.averageTimeToFireSeconds)}
      </Typography>
      <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
        위협 노출:{" "}
        {formatFireRecommendationThreatExposure(
          recommendation.threatExposureScore
        )}
      </Typography>

      {recommendation.options.length > 0 && (
        <>
          <Typography sx={{ mt: 1.1, fontSize: 12.5, fontWeight: 700 }}>
            추천안 비교
          </Typography>
          <Stack spacing={0.8} sx={{ mt: 0.6 }}>
            {recommendation.options.map((option) => (
              <Box
                key={option.label}
                sx={{
                  p: 0.9,
                  borderRadius: 1.5,
                  backgroundColor:
                    option.label === recommendation.recommendedOptionLabel
                      ? "rgba(45, 214, 196, 0.12)"
                      : "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(45, 214, 196, 0.14)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ flexWrap: "wrap" }}
                >
                  <Stack
                    direction="row"
                    spacing={0.8}
                    alignItems="center"
                    sx={{ flexWrap: "wrap" }}
                  >
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                      {option.label}
                    </Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`점수 ${option.suitabilityScore.toFixed(1)}`}
                    />
                    {feedbackOptionLabel === option.label && (
                      <Chip
                        size="small"
                        color="success"
                        variant="filled"
                        label="학습 기준"
                      />
                    )}
                  </Stack>
                  {onRecordFeedback && (
                    <Button
                      size="small"
                      variant={
                        feedbackOptionLabel === option.label
                          ? "contained"
                          : "text"
                      }
                      onClick={() => onRecordFeedback(option.label)}
                    >
                      {feedbackOptionLabel === option.label
                        ? "기록됨"
                        : "이 안으로 학습"}
                    </Button>
                  )}
                </Stack>
                <Typography
                  sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary" }}
                >
                  {option.ammoType} · {option.weaponName} · {option.shotCount}발
                  · 예상효과 {option.expectedStrikeEffect.toFixed(2)}
                </Typography>
                <Typography
                  sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}
                >
                  발포 부대 {option.launcherCount}개 · 거리{" "}
                  {option.averageDistanceKm?.toFixed(1) ?? "0.0"}km
                </Typography>
                <Typography
                  sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}
                >
                  {option.executionReadinessLabel} · 즉시{" "}
                  {option.immediateLaunchReadyCount}개 · 기동{" "}
                  {option.repositionRequiredCount}개 · 차단{" "}
                  {option.blockedLauncherCount}개
                </Typography>
                <Typography
                  sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}
                >
                  ETA{" "}
                  {formatFireRecommendationEta(option.averageTimeToFireSeconds)}
                  {" · "}위협{" "}
                  {formatFireRecommendationThreatExposure(
                    option.threatExposureScore
                  )}
                </Typography>
                <Typography
                  sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}
                >
                  규칙 {option.heuristicScore.toFixed(1)}
                  {option.rerankerScore != null
                    ? ` · AI ${option.rerankerScore.toFixed(3)}`
                    : ""}
                </Typography>
                {option.aiReasonSummary && (
                  <Typography
                    sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}
                  >
                    AI 판단: {option.aiReasonSummary}
                  </Typography>
                )}
                {option.aiPositiveSignals &&
                  option.aiPositiveSignals.length > 0 && (
                    <Typography
                      sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}
                    >
                      강점: {option.aiPositiveSignals.join(" / ")}
                    </Typography>
                  )}
                {option.aiNegativeSignals &&
                  option.aiNegativeSignals.length > 0 && (
                    <Typography
                      sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}
                    >
                      주의: {option.aiNegativeSignals.join(" / ")}
                    </Typography>
                  )}
                <Typography
                  sx={{ mt: 0.45, fontSize: 12, color: "text.secondary" }}
                >
                  {option.rationale}
                </Typography>
              </Box>
            ))}
          </Stack>
        </>
      )}

      {topOption && topOption.firingPlan.length > 0 && (
        <>
          <Typography sx={{ mt: 1.1, fontSize: 12.5, fontWeight: 700 }}>
            발포 계획
          </Typography>
          <Stack spacing={0.6} sx={{ mt: 0.6 }}>
            {topOption.firingPlan.map((plan) => (
              <Box
                key={`${topOption.label}-${plan.launcherId}`}
                sx={{
                  p: 0.85,
                  borderRadius: 1.5,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(45, 214, 196, 0.12)",
                }}
              >
                <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                  {plan.launcherName}
                </Typography>
                <Typography
                  sx={{ mt: 0.35, fontSize: 12.5, color: "text.secondary" }}
                >
                  {getDisplayName(plan.launcherClassName)} · {plan.ammoType} ·{" "}
                  {plan.weaponName} · {plan.shotCount}발
                </Typography>
                <Typography
                  sx={{ mt: 0.25, fontSize: 12.5, color: "text.secondary" }}
                >
                  목표 거리 {plan.distanceKm.toFixed(1)}km · 예상효과{" "}
                  {plan.expectedStrikeEffect.toFixed(2)}
                </Typography>
                <Typography
                  sx={{ mt: 0.25, fontSize: 12.5, color: "text.secondary" }}
                >
                  {plan.executionState === "ready"
                    ? "즉시 발사"
                    : plan.executionState === "reposition"
                      ? "기동 후 발사"
                      : "발사 곤란"}
                  {" · "}ETA{" "}
                  {formatFireRecommendationEta(plan.estimatedTimeToFireSeconds)}
                  {" · "}위협{" "}
                  {formatFireRecommendationThreatExposure(
                    plan.threatExposureScore
                  )}
                </Typography>
              </Box>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}
