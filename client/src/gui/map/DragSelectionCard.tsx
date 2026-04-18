import { useRef } from "react";
import type { Feature } from "ol";
import type { Geometry } from "ol/geom";
import Draggable from "react-draggable";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { colorPalette } from "@/utils/constants";
import Game, { type FireRecommendationTargetPriority } from "@/game/Game";
import {
  getDisplayName,
  getEntityTypeLabel,
} from "@/utils/koreanCatalog";
import FireRecommendationPanel, {
  FireRecommendationPriorityList,
} from "@/gui/fires/FireRecommendationPanel";

interface DragSelectionCardProps {
  game: Game;
  sideId: string;
  mobileView: boolean;
  features: Feature<Geometry>[];
  priorities: FireRecommendationTargetPriority[];
  selectedTargetId: string | null;
  onSelectTarget: (targetId: string) => void;
  onCreateStrikeMission: () => void;
  onInspectFeature: (feature: Feature<Geometry>) => void;
  onClearSelection: () => void;
}

const cardHeaderStyle = {
  backgroundColor: colorPalette.white,
  color: "var(--fs-text)",
  height: "50px",
};

const closeButtonStyle = {
  bottom: 5.5,
};

export default function DragSelectionCard({
  game,
  sideId,
  mobileView,
  features,
  priorities,
  selectedTargetId,
  onSelectTarget,
  onCreateStrikeMission,
  onInspectFeature,
  onClearSelection,
}: Readonly<DragSelectionCardProps>) {
  const nodeRef = useRef(null);
  const hostileFeatureCount = features.filter((feature) => {
    const featureSideId = feature.get("sideId");
    return featureSideId && game.getFocusFireHostileSideIds(sideId).has(featureSideId);
  }).length;
  const selectedRecommendation = selectedTargetId
    ? game.getFireRecommendationForTarget(selectedTargetId, sideId)
    : null;

  return (
    <div
      style={{
        position: "absolute",
        right: mobileView ? "1rem" : "1.5rem",
        top: mobileView ? "5.2rem" : "6rem",
        zIndex: "1001",
      }}
    >
      <Draggable nodeRef={nodeRef}>
        <Card
          ref={nodeRef}
          sx={{
            width: mobileView ? "min(92vw, 420px)" : 420,
            maxHeight: "78vh",
            overflowY: "auto",
            backgroundColor: colorPalette.lightGray,
            boxShadow: "none",
            borderRadius: "10px",
          }}
        >
          <CardHeader
            sx={cardHeaderStyle}
            action={
              <IconButton
                type="button"
                sx={closeButtonStyle}
                onClick={onClearSelection}
                aria-label="close"
              >
                <CloseIcon color="error" />
              </IconButton>
            }
            title={
              <Typography variant="body1" component="h1" sx={{ pl: 1 }}>
                영역 선택
              </Typography>
            }
          />
          <CardContent
            sx={{ display: "flex", flexDirection: "column", rowGap: "10px" }}
          >
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
              sx={{ flexWrap: "wrap" }}
            >
              <Chip size="small" label={`선택 ${features.length}개`} />
              <Chip
                size="small"
                variant="outlined"
                label={`적 표적 ${hostileFeatureCount}개`}
              />
              {priorities.length > 0 && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={onCreateStrikeMission}
                >
                  타격 임무 생성
                </Button>
              )}
              <Button size="small" variant="text" onClick={onClearSelection}>
                선택 비우기
              </Button>
            </Stack>

            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              `Ctrl`을 누른 채 드래그하면 현재 화면의 개체를 바탕화면처럼 묶어서 고를 수 있습니다.
            </Typography>

            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
              선택된 개체
            </Typography>
            <Stack spacing={0.7}>
              {features.slice(0, 8).map((feature) => {
                const featureId = feature.get("id");
                const featureName = getDisplayName(feature.get("name"));
                const featureType = getEntityTypeLabel(feature.get("type"));
                const featureSideName = game.currentScenario.getSideName(
                  feature.get("sideId")
                );

                return (
                  <Box
                    key={featureId}
                    sx={{
                      p: 0.85,
                      borderRadius: 1.5,
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(45, 214, 196, 0.12)",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{ fontSize: 12.5, fontWeight: 700 }}
                          noWrap
                        >
                          {featureName}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.25,
                            fontSize: 12,
                            color: "text.secondary",
                          }}
                          noWrap
                        >
                          {featureSideName} · {featureType}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onInspectFeature(feature)}
                      >
                        열기
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
              {features.length > 8 && (
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  외 {features.length - 8}개
                </Typography>
              )}
            </Stack>

            {priorities.length > 0 && (
              <>
                <Divider />
                <FireRecommendationPriorityList
                  priorities={priorities}
                  selectedTargetId={selectedTargetId}
                  onSelectTarget={onSelectTarget}
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
                    선택 표적 화력 추천
                  </Typography>
                  <Box sx={{ mt: 0.8 }}>
                    <FireRecommendationPanel
                      recommendation={selectedRecommendation}
                      rerankerModel={game.getFocusFireRerankerState().model}
                      objectiveName={
                        priorities.find((entry) => entry.targetId === selectedTargetId)
                          ?.targetName ?? null
                      }
                    />
                  </Box>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Draggable>
    </div>
  );
}
