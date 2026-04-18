import { useRef } from "react";
import Draggable from "react-draggable";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CloseIcon from "@mui/icons-material/Close";
import { CardContent, IconButton, Typography } from "@mui/material";
import { colorPalette } from "@/utils/constants";
import type { FocusFireRecommendation } from "@/game/Game";
import type { FocusFireRerankerModel } from "@/game/focusFireReranker";
import FireRecommendationPanel from "@/gui/fires/FireRecommendationPanel";

interface TargetFireRecommendationCardProps {
  top: number;
  left: number;
  targetName: string;
  targetLatitude: number;
  targetLongitude: number;
  recommendation: FocusFireRecommendation | null;
  rerankerModel: FocusFireRerankerModel;
  handleCloseOnMap: () => void;
}

const cardStyle = {
  minWidth: "420px",
  maxWidth: "420px",
  maxHeight: "78vh",
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

const closeButtonStyle = {
  bottom: 5.5,
};

export default function TargetFireRecommendationCard({
  top,
  left,
  targetName,
  targetLatitude,
  targetLongitude,
  recommendation,
  rerankerModel,
  handleCloseOnMap,
}: Readonly<TargetFireRecommendationCardProps>) {
  const nodeRef = useRef(null);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
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
                onClick={handleCloseOnMap}
                aria-label="close"
              >
                <CloseIcon color="error" />
              </IconButton>
            }
            title={
              <Typography variant="body1" component="h1" sx={{ pl: 1 }}>
                즉시 화력 추천
              </Typography>
            }
          />
          <CardContent
            sx={{ display: "flex", flexDirection: "column", rowGap: "10px" }}
          >
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              우클릭 표적: {targetName}
            </Typography>
            <FireRecommendationPanel
              recommendation={recommendation}
              rerankerModel={rerankerModel}
              objectiveName={targetName}
              objectiveLatitude={targetLatitude}
              objectiveLongitude={targetLongitude}
            />
          </CardContent>
        </Card>
      </Draggable>
    </div>
  );
}
