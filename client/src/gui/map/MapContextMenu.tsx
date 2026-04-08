import React, { useContext, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { UnitDbContext } from "@/gui/contextProviders/contexts/UnitDbContext";
import { Stack, Tooltip, Typography } from "@mui/material";
import { getDisplayName } from "@/utils/koreanCatalog";

interface MapContextMenuProps {
  anchorPositionTop: number;
  anchorPositionLeft: number;
  handleCloseOnMap: () => void;
  handleAddReferencePoint: () => void;
  handleAddAirbase: () => void;
  handleAddAircraft: (unitClassName: string) => void;
  handleAddShip: (unitClassName: string) => void;
  handleAddFacility: (unitClassName: string) => void;
}

export default function MapContextMenu({
  anchorPositionTop,
  anchorPositionLeft,
  handleCloseOnMap,
  handleAddReferencePoint,
  handleAddAirbase,
  handleAddAircraft,
  handleAddShip,
  handleAddFacility,
}: Readonly<MapContextMenuProps>) {
  const [aircraftMenuAnchor, setAircraftMenuAnchor] =
    useState<HTMLElement | null>(null);
  const [shipMenuAnchor, setShipMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [facilityMenuAnchor, setFacilityMenuAnchor] =
    useState<HTMLElement | null>(null);
  const unitDbContext = useContext(UnitDbContext);

  const closeAll = () => {
    setAircraftMenuAnchor(null);
    setShipMenuAnchor(null);
    setFacilityMenuAnchor(null);
    handleCloseOnMap();
  };

  const commonPaperSx = {
    borderRadius: 2,
    boxShadow: 4,
    minWidth: 180,
    p: 0,
  };

  return (
    <>
      <Menu
        disableAutoFocusItem
        open
        onClose={closeAll}
        anchorReference="anchorPosition"
        anchorPosition={{ top: anchorPositionTop, left: anchorPositionLeft }}
        slotProps={{
          paper: { sx: commonPaperSx },
        }}
      >
        <MenuItem
          onClick={() => {
            handleAddReferencePoint();
            closeAll();
          }}
          sx={{ borderRadius: 1 }}
        >
          참조점 추가
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleAddAirbase();
            closeAll();
          }}
          sx={{ borderRadius: 1 }}
        >
          기지 추가
        </MenuItem>
        <MenuItem
          onClick={(e) => setAircraftMenuAnchor(e.currentTarget)}
          sx={{ justifyContent: "space-between", borderRadius: 1 }}
        >
          <span>항공기 추가</span>
          <span>▶</span>
        </MenuItem>
        <MenuItem
          onClick={(e) => setShipMenuAnchor(e.currentTarget)}
          sx={{ justifyContent: "space-between", borderRadius: 1 }}
        >
          <span>함정 추가</span>
          <span>▶</span>
        </MenuItem>
        <MenuItem
          onClick={(e) => setFacilityMenuAnchor(e.currentTarget)}
          sx={{ justifyContent: "space-between", borderRadius: 1 }}
        >
          <span>지상 무기체계 추가</span>
          <span>▶</span>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={aircraftMenuAnchor}
        open={Boolean(aircraftMenuAnchor)}
        onClose={() => setAircraftMenuAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: { sx: commonPaperSx },
          list: { onMouseLeave: () => setAircraftMenuAnchor(null) },
        }}
      >
        {unitDbContext.getAircraftDb().map((aircraft) => (
          <Tooltip
            key={aircraft.className}
            placement="right"
            arrow
            title={
              <Stack direction={"column"} spacing={0.1}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  속도: {aircraft.speed.toFixed(0)} kts
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  최대 연료: {aircraft.maxFuel.toFixed(2)} lbs
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  연료 소모: {aircraft.fuelRate.toFixed(2)} lbs/hr
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  탐지 범위: {aircraft.range.toFixed(0)} nm
                </Typography>
              </Stack>
            }
          >
            <MenuItem
              onClick={() => {
                handleAddAircraft(aircraft.className);
                closeAll();
              }}
              sx={{ borderRadius: 1 }}
            >
              {getDisplayName(aircraft.className)}
            </MenuItem>
          </Tooltip>
        ))}
      </Menu>

      <Menu
        anchorEl={shipMenuAnchor}
        open={Boolean(shipMenuAnchor)}
        onClose={() => setShipMenuAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: { sx: commonPaperSx },
          list: { onMouseLeave: () => setShipMenuAnchor(null) },
        }}
      >
        {unitDbContext.getShipDb().map((ship) => (
          <Tooltip
            key={ship.className}
            placement="right"
            arrow
            title={
              <Stack direction={"column"} spacing={0.1}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  속도: {ship.speed.toFixed(0)} kts
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  최대 연료: {ship.maxFuel.toFixed(2)} lbs
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  연료 소모: {ship.fuelRate.toFixed(2)} lbs/hr
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  탐지 범위: {ship.range.toFixed(0)} nm
                </Typography>
              </Stack>
            }
          >
            <MenuItem
              onClick={() => {
                handleAddShip(ship.className);
                closeAll();
              }}
              sx={{ borderRadius: 1 }}
            >
              {getDisplayName(ship.className)}
            </MenuItem>
          </Tooltip>
        ))}
      </Menu>

      <Menu
        anchorEl={facilityMenuAnchor}
        open={Boolean(facilityMenuAnchor)}
        onClose={() => setFacilityMenuAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: { sx: commonPaperSx },
          list: { onMouseLeave: () => setFacilityMenuAnchor(null) },
        }}
      >
        {unitDbContext.getFacilityDb().map((facility) => (
          <Tooltip
            key={facility.className}
            placement="right"
            arrow
            title={
              <Stack direction={"column"} spacing={0.1}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  탐지 범위: {facility.range.toFixed(0)} nm
                </Typography>
              </Stack>
            }
          >
            <MenuItem
              onClick={() => {
                handleAddFacility(facility.className);
                closeAll();
              }}
              sx={{ borderRadius: 1 }}
            >
              {getDisplayName(facility.className)}
            </MenuItem>
          </Tooltip>
        ))}
      </Menu>
    </>
  );
}
