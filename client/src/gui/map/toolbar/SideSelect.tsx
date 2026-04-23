import Side from "@/game/Side";
import {
  MenuItem,
  Select,
  SelectChangeEvent,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import EntityIcon from "@/gui/map/toolbar/EntityIcon";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { COLOR_PALETTE } from "@/utils/colors";

interface SideSelectProps {
  sides: Side[];
  currentSideId: string;
  onSideSelect: (sideId: string) => void;
  openSideEditor: (sideId: string | null) => void;
}

export default function SideSelect(props: Readonly<SideSelectProps>) {
  const selectedSide =
    props.sides.find((side) => side.id === props.currentSideId)

  const ellipsifySideName = (name: string, maxLength: number = 16) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + "...";
    }
    return name;
  };

  return (
    <Select
      id="side-select"
      value={selectedSide?.id ?? ""}
      onChange={(event: SelectChangeEvent<string>) => {
        if (event.target.value !== selectedSide?.id) {
          props.onSideSelect(event.target.value);
        }
      }}
      displayEmpty
      sx={{
        height: 38,
        minWidth: 250,
        borderRadius: 1.5,
        fontSize: 14,
        backgroundColor: COLOR_PALETTE.WHITE,
        boxShadow: "0 14px 28px rgba(0, 0, 0, 0.22)",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: COLOR_PALETTE.DARK_GRAY,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: COLOR_PALETTE.BLACK,
        },
        "& .MuiSelect-select": {
          display: "flex",
          alignItems: "center",
        },
      }}
      renderValue={() =>
        selectedSide ? (
          <Box display="flex" alignItems="center" gap={1}>
            <EntityIcon
              type="circle"
              color={selectedSide.color}
              width={20}
              height={20}
            />
            <span>{ellipsifySideName(selectedSide.name, 24)}</span>
          </Box>
        ) : (
          <em>세력 선택</em>
        )
      }
    >
      {props.sides.map((side) => (
        <MenuItem
          key={side.id}
          value={side.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            "&:hover": {
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
            },
            "&.Mui-selected": {
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              "&:hover": {
                backgroundColor: COLOR_PALETTE.DARK_GRAY,
              },
            },
          }}
        >
          <Box display="flex" alignItems="center">
            <ListItemIcon sx={{ minWidth: 30 }}>
              <EntityIcon
                type="circle"
                color={side.color}
                width={20}
                height={20}
              />
            </ListItemIcon>
            <ListItemText primary={ellipsifySideName(side.name)} />
          </Box>
          <IconButton
            edge="end"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              props.openSideEditor(side.id);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </MenuItem>
      ))}

      {/* Divider and Add Side */}
      <Divider sx={{ my: 1 }} />
      <MenuItem
        sx={{
          "&:hover": {
            backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
          },
        }}
        value="add-side"
        onClick={() => props.openSideEditor(null)}
      >
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="세력 추가" />
      </MenuItem>
    </Select>
  );
}
