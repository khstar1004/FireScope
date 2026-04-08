import { useContext, useState } from "react";
import { Add, Delete, Remove, RocketLaunch } from "@mui/icons-material";
import {
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import QuantitySlider from "@/gui/map/feature/shared/QuantitySlider";
import { UnitDbContext } from "@/gui/contextProviders/contexts/UnitDbContext";
import Weapon from "@/game/units/Weapon";
import Aircraft from "@/game/units/Aircraft";
import Facility from "@/game/units/Facility";
import Ship from "@/game/units/Ship";
import Army from "@/game/units/Army";
import { getDisplayName } from "@/utils/koreanCatalog";

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

interface WeaponTableProps {
  unitWithWeapon: Aircraft | Facility | Ship | Army;
  handleAddWeapon: (attackerId: string, weaponClassName: string) => Weapon[];
  handleDeleteWeapon: (attackerId: string, weaponId: string) => Weapon[];
  handleUpdateWeaponQuantity: (
    attackerId: string,
    weaponId: string,
    increment: number
  ) => Weapon[];
  handleUnitAttack?: (
    attackerId: string,
    weaponId: string,
    weaponQuantity: number
  ) => void;
  handleCloseOnMap: () => void;
}

export default function WeaponTable(props: Readonly<WeaponTableProps>) {
  const [unitWeapons, setUnitWeapons] = useState(props.unitWithWeapon.weapons);
  const unitDbContext = useContext(UnitDbContext);

  const [addWeaponMenuAnchorEl, setAddWeaponMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const openAddWeaponMenu = Boolean(addWeaponMenuAnchorEl);
  const handleClickAddWeaponButton = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAddWeaponMenuAnchorEl(event.currentTarget);
  };
  const handleCloseAddWeaponMenu = () => {
    setAddWeaponMenuAnchorEl(null);
  };

  const _handleAddWeapon = (weaponClassName: string) => {
    const unitWeapons = props.handleAddWeapon(
      props.unitWithWeapon.id,
      weaponClassName
    );
    setUnitWeapons([...unitWeapons]);
  };

  const _handleDeleteWeapon = (weaponId: string) => {
    const unitWeapons = props.handleDeleteWeapon(
      props.unitWithWeapon.id,
      weaponId
    );
    setUnitWeapons([...unitWeapons]);
  };

  const _handleUpdateWeaponQuantity = (weaponId: string, increment: number) => {
    const unitWeapons = props.handleUpdateWeaponQuantity(
      props.unitWithWeapon.id,
      weaponId,
      increment
    );
    setUnitWeapons([...unitWeapons]);
  };

  const _handleUnitAttack = (weaponQuantity: number) => {
    if (!props.handleUnitAttack) return;
    props.handleCloseOnMap();
    props.handleUnitAttack(
      props.unitWithWeapon.id,
      currentWeaponLaunchParams.weaponId,
      weaponQuantity
    );
  };

  const [launchWeaponMenuAnchorEl, setLaunchWeaponMenuAnchorEl] =
    useState<null | HTMLElement>(null);
  const openLaunchWeaponMenu = Boolean(launchWeaponMenuAnchorEl);
  const [currentWeaponLaunchParams, setCurrentWeaponLaunchParams] = useState({
    weaponId: "",
    weaponMaxQuantity: 0,
  });
  const handleClickLaunchWeaponButton = (
    event: React.MouseEvent<HTMLButtonElement>,
    weaponId: string
  ) => {
    const weapon = unitWeapons.find((w) => w.id === weaponId);
    if (!weapon || (weapon && weapon.currentQuantity <= 0)) return;
    setCurrentWeaponLaunchParams({
      weaponId: weaponId,
      weaponMaxQuantity: weapon.currentQuantity,
    });
    setLaunchWeaponMenuAnchorEl(event.currentTarget);
  };
  const handleCloseLaunchWeaponMenu = () => {
    setLaunchWeaponMenuAnchorEl(null);
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          minWidth: 500,
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Table size="small" aria-label="unitWithWeapon-weapons-table">
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell
                component="th"
                scope="row"
                align="right"
                sx={{ ...tableKeyCellStyle }}
              >
                무장
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="right"
                sx={{ ...tableKeyCellStyle, minWidth: "6em" }}
              >
                사거리
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                align="center"
                sx={{ ...tableKeyCellStyle, minWidth: "8em" }}
              >
                수량
              </TableCell>
              <TableCell
                align="right"
                component="th"
                scope="row"
                sx={{ ...tableKeyCellStyle, minWidth: "5em" }}
              >
                <Tooltip title={`무장 추가`}>
                  <IconButton
                    id={"add-weapons-button"}
                    onClick={handleClickAddWeaponButton}
                  >
                    <Add sx={{ color: "white" }} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unitWeapons.length === 0 && (
              <TableRow sx={tableRowStyle}>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ ...tableValueCellStyle, color: "gray" }}
                >
                  장착된 무장이 없습니다.
                </TableCell>
              </TableRow>
            )}
            {unitWeapons.length > 0 &&
              unitWeapons.map((weapon, index) => (
                <TableRow
                  sx={tableRowStyle}
                  key={`${weapon.className}-${index}`}
                >
                  <TableCell align="right" sx={tableValueCellStyle}>
                    {getDisplayName(weapon.className)}
                  </TableCell>
                  <TableCell align="right" sx={tableValueCellStyle}>
                    {weapon.getEngagementRange().toFixed(0)} NM
                  </TableCell>
                  <TableCell align="center" sx={tableValueCellStyle}>
                    <>
                      <Tooltip title={`수량 감소`}>
                        <IconButton
                          onClick={() =>
                            _handleUpdateWeaponQuantity(weapon.id, -1)
                          }
                        >
                          <Remove sx={{ color: "white" }} />
                        </IconButton>
                      </Tooltip>
                      {weapon.currentQuantity}
                      <Tooltip title={`수량 증가`}>
                        <IconButton
                          onClick={() =>
                            _handleUpdateWeaponQuantity(weapon.id, 1)
                          }
                        >
                          <Add sx={{ color: "white" }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  </TableCell>
                  <TableCell align="right" sx={tableValueCellStyle}>
                    <>
                      {props.handleUnitAttack && (
                        <Tooltip title={`무장 발사`}>
                          <IconButton
                            onClick={(
                              event: React.MouseEvent<HTMLButtonElement>
                            ) => {
                              handleClickLaunchWeaponButton(event, weapon.id);
                            }}
                          >
                            <RocketLaunch sx={{ color: "white" }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={`무장 삭제`}>
                        <IconButton
                          onClick={() => _handleDeleteWeapon(weapon.id)}
                        >
                          <Delete sx={{ color: "red" }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Menu
        id="add-weapons-menu"
        anchorEl={addWeaponMenuAnchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        open={openAddWeaponMenu}
        onClose={handleCloseAddWeaponMenu}
        slotProps={{
          root: { sx: { ".MuiList-root": { padding: 0 } } },
          list: {
            "aria-labelledby": "add-weapons-button",
          },
        }}
      >
        {unitDbContext.getWeaponDb().map((weapon) => (
          <Tooltip
            key={weapon.className}
            placement="right"
            arrow
            title={
              <Stack direction={"column"} spacing={0.1}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  속도: {weapon.speed.toFixed(0)} kts
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  최대 연료: {weapon.maxFuel.toFixed(2)} lbs
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  연료 소모: {weapon.fuelRate.toFixed(2)} lbs/hr
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  명중/격파 확률: {(weapon.lethality * 100).toFixed(2)}%
                </Typography>
              </Stack>
            }
          >
            <MenuItem
              onClick={() => {
                _handleAddWeapon(weapon.className);
                handleCloseAddWeaponMenu();
              }}
              sx={{ borderRadius: 1 }}
            >
              {getDisplayName(weapon.className)}
            </MenuItem>
          </Tooltip>
        ))}
      </Menu>
      <QuantitySlider
        open={openLaunchWeaponMenu}
        anchorEl={launchWeaponMenuAnchorEl}
        min={currentWeaponLaunchParams.weaponMaxQuantity > 0 ? 1 : 0}
        max={currentWeaponLaunchParams.weaponMaxQuantity}
        startValue={1}
        handleCloseOnMap={handleCloseLaunchWeaponMenu}
        handleConfirm={_handleUnitAttack}
      />
    </>
  );
}
