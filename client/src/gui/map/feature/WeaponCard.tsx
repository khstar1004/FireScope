import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import FeaturePopup from "@/gui/map/FeaturePopup";
import DeleteIcon from "@mui/icons-material/Delete";
import Stack from "@mui/material/Stack";
import TelegramIcon from "@mui/icons-material/Telegram";
import {
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  ListItemButton,
  CardHeader,
  Divider,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { Menu } from "@/gui/shared/ui/MuiComponents";
import Weapon from "@/game/units/Weapon";
import CombatStatusBar from "@/gui/map/feature/shared/CombatStatusBar";
import { getDisplayName } from "@/utils/koreanCatalog";
import ExperienceLaunchButton from "@/gui/experience/ExperienceLaunchButton";

interface WeaponCardProps {
  weapon: Weapon;
  sideName: string;
  handleTeleportUnit: (unitId: string) => void;
  handleDeleteWeapon: (weaponId: string) => void;
  openAssetExperience: () => void;
  handleCloseOnMap: () => void;
  anchorPositionTop: number;
  anchorPositionLeft: number;
}

const tableRowStyle = {
  border: 0,
};

const tableKeyCellStyle = {
  whiteSpace: "nowrap",
  color: "white",
  border: "none",
  p: 0.5,
  typography: "body1",
};

const tableValueCellStyle = {
  wordBreak: "break-word",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 200,
  color: "white",
  border: "none",
  p: 0.5,
  typography: "body1",
};

export default function WeaponCard(props: Readonly<WeaponCardProps>) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const _handleTeleportWeapon = () => {
    props.handleCloseOnMap();
    props.handleTeleportUnit(props.weapon.id);
  };

  const _handleDeleteWeapon = () => {
    props.handleCloseOnMap();
    props.handleDeleteWeapon(props.weapon.id);
  };

  const _handleOpenAssetExperience = () => {
    props.handleCloseOnMap();
    props.openAssetExperience();
  };

  const weaponDataContent = (
    <TableContainer
      component={Paper}
      sx={{
        width: "100%",
        maxWidth: 600,
        minWidth: 350,
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
      <Table size="small" aria-label="facility-feature-table">
        <TableBody>
          <TableRow sx={tableRowStyle}>
            <TableCell component="th" scope="row" sx={tableKeyCellStyle}>
              좌표:
            </TableCell>
            <TableCell align="right" sx={tableValueCellStyle}>
              {props.weapon.latitude.toFixed(2)},{" "}
              {props.weapon.longitude.toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow sx={tableRowStyle}>
            <TableCell component="th" scope="row" sx={tableKeyCellStyle}>
              속도:
            </TableCell>
            <TableCell align="right" sx={tableValueCellStyle}>
              {props.weapon.speed.toFixed(0)} KTS
            </TableCell>
          </TableRow>
          <TableRow sx={tableRowStyle}>
            <TableCell component="th" scope="row" sx={tableKeyCellStyle}>
              고도:
            </TableCell>
            <TableCell align="right" sx={tableValueCellStyle}>
              {props.weapon.altitude.toFixed(2)} FT
            </TableCell>
          </TableRow>
          <TableRow sx={tableRowStyle}>
            <TableCell component="th" scope="row" sx={tableKeyCellStyle}>
              교전 사거리:
            </TableCell>
            <TableCell align="right" sx={tableValueCellStyle}>
              {props.weapon.getEngagementRange().toFixed(0)} NM
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  const defaultCardActions = (
    <Stack spacing={0.5} direction="column" onMouseLeave={handleClose}>
      <ListItemButton onClick={_handleTeleportWeapon}>
        <TelegramIcon sx={{ mr: 0.5 }} /> 위치 수정
      </ListItemButton>
    </Stack>
  );

  const WeaponCard = (
    <Box sx={{ minWidth: 150 }}>
      <Card
        sx={{
          backgroundColor: "#282c34",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "left",
        }}
      >
        <CardHeader
          action={
            <Stack direction={"row"} spacing={0}>
              <Tooltip title={`${props.weapon.name} 삭제`}>
                <IconButton onClick={_handleDeleteWeapon}>
                  <DeleteIcon sx={{ color: "red" }} />
                </IconButton>
              </Tooltip>
              <ExperienceLaunchButton
                tooltip={`${props.weapon.name} 3D 시뮬레이터`}
                onClick={_handleOpenAssetExperience}
              />
              <Tooltip title={`추가 작업`}>
                <Button
                  id="facility-feature-actions-button"
                  aria-controls={
                    open ? "facility-feature-actions-menu" : undefined
                  }
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                  variant="outlined"
                  size="small"
                  color="inherit"
                >
                  작업
                </Button>
              </Tooltip>
              <Menu
                id="facility-feature-actions-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                  root: { sx: { ".MuiList-root": { padding: 0 } } },
                  list: {
                    "aria-labelledby": "facility-feature-actions-button",
                  },
                }}
              >
                {defaultCardActions}
              </Menu>
            </Stack>
          }
          title={
            <Typography variant="h6" component="div">
              {props.weapon.name}
            </Typography>
          }
          subheader={
            <Stack
              direction={"column"}
              spacing={0}
              sx={{ color: "rgba(221, 255, 250, 0.74)" }}
            >
              <Typography variant="caption">
                유형: {getDisplayName(props.weapon.className)}
              </Typography>
              <Typography variant="caption">
                세력:{" "}
                <Typography variant="caption" component={"span"}>
                  {props.sideName}
                </Typography>
              </Typography>
            </Stack>
          }
        />
        <CombatStatusBar
          currentHp={props.weapon.currentHp}
          maxHp={props.weapon.maxHp}
          defense={props.weapon.defense}
          attackPower={props.weapon.attackPower}
        />
        <Divider
          orientation="horizontal"
          variant="middle"
          flexItem
          sx={{ borderColor: "white", mb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>{weaponDataContent}</CardContent>
      </Card>
    </Box>
  );

  return (
    <FeaturePopup
      anchorPositionTop={props.anchorPositionTop}
      anchorPositionLeft={props.anchorPositionLeft}
      content={WeaponCard}
      handleCloseOnMap={props.handleCloseOnMap}
    ></FeaturePopup>
  );
}
