import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ViewInArOutlinedIcon from "@mui/icons-material/ViewInArOutlined";

interface ExperienceLaunchButtonProps {
  tooltip: string;
  onClick: () => void;
  label?: string;
}

export default function ExperienceLaunchButton({
  tooltip,
  onClick,
  label = "3D",
}: Readonly<ExperienceLaunchButtonProps>) {
  return (
    <Tooltip title={tooltip}>
      <Button
        variant="contained"
        size="small"
        onClick={onClick}
        startIcon={<ViewInArOutlinedIcon fontSize="small" />}
        sx={{
          minWidth: 0,
          px: 1.25,
          backgroundColor: "#2e5678",
          color: "#f4f9ff",
          fontWeight: 700,
          textTransform: "none",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#41739c",
            boxShadow: "none",
          },
        }}
      >
        {label}
      </Button>
    </Tooltip>
  );
}
