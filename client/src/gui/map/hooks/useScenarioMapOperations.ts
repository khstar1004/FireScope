// @ts-nocheck

export function useScenarioMapOperations(ctx) {
  const {
    DEFAULT_OL_PROJECTION_CODE, Draw, NAUTICAL_MILES_TO_METERS,
    Overlay, airbasesLayer, aircraftLayer,
    aircraftRouteLayer, armyLayer, armyRouteLayer,
    baseMapLayers, baseMapModeIdRef, changeCursorType,
    clearLiveCommentaryNotifications, clearPendingFacilityGroupTeleport, defaultProjection,
    dragSelectedFeatures, facilityLayer, facilityPlacementGroupLayer,
    facilityPlacementGroups, featureLabelLayer, featureLabelVisible,
    findFacilityPlacementGroupByFacilityId, fromLonLat, game,
    getDisplayName, getLength, handleFeatureEntityStateAction,
    loadFacilityPlacementGroupsFromScenario, loadFeatureEntitiesState, missionEditorActive,
    openAirbaseCard, openAircraftCard, openArmyCard,
    openFacilityCard, openReferencePointCard, openShipCard,
    projection, randomInt, referencePointLayer,
    resolveMatchingFacilityPlacementGroup, routeMeasurementDrawLineRef, routeMeasurementListenerRef,
    routeMeasurementTooltipRef, routeMeasurementTooltipElementRef, routeVisible,
    selectingFocusFireObjective, setBaseMapModeId, setCurrentGameStatusToContext,
    setCurrentScenarioTimeCompression, setCurrentScenarioTimeToContext, setCurrentSideId,
    setCurrentSimulationLogsToContext, setFeatureLabelVisible, setKeyboardShortcutsEnabled,
    setMissionCreatorActive, setMissionCreatorInitialMissionType, setMissionCreatorInitialTargetIds,
    setMissionEditorActive, setOpenAirbaseCard, setOpenAircraftCard,
    setOpenArmyCard, setOpenFacilityCard, setOpenReferencePointCard,
    setOpenShipCard, setOpenSideEditor, setReferencePointVisible,
    setRouteVisible, setSelectingFocusFireObjective, setSimulationLogsActive,
    setThreatRangeVisible, setWeaponTrajectoryVisible, shipLayer,
    shipRouteLayer, syncLiveCommentaryNotifications, teleportingFacilityGroupIdRef,
    teleportingUnitRef, theMap, threatRangeLayer,
    threatRangeVisible, toLonLat, toastContext,
    transform, unByKey, unitDbContext,
    weaponLayer, weaponTrajectoryLayer, weaponTrajectoryVisible,
  } = ctx;

  function stepGameForStepSize(stepSize: number): GameStepResult {
    return game.stepForTimeCompression(stepSize);
  }

  function stepGameAndDrawFrame() {
    // const gameStepStartTime = new Date().getTime();
    const [observation, reward, terminated, truncated, info] =
      stepGameForStepSize(game.currentScenario.timeCompression);
    // const gameStepElapsed = new Date().getTime() - gameStepStartTime;

    setCurrentScenarioTimeToContext(observation.currentTime);
    updateCurrentSimulationLogsToContext();

    // const guiDrawStartTime = new Date().getTime();
    drawNextFrame(observation);
    game.recordStep();
    // const guiDrawElapsed = new Date().getTime() - guiDrawStartTime;
    // console.log('gameStepElapsed:', gameStepElapsed, 'guiDrawElapsed:', guiDrawElapsed)

    return [observation, reward, terminated, truncated, info];
  }

  function drawNextFrame(observation: Scenario) {
    aircraftLayer.refresh(observation.aircraft);
    refreshWeaponTrajectoryLayer(observation);
    weaponLayer.refresh(observation.weapons);
    shipLayer.refresh(observation.ships);
    armyLayer.refresh(observation.armies);
    facilityLayer.refresh(observation.facilities);
    airbasesLayer.refresh(observation.airbases);
    refreshRouteLayer(observation);
    if (featureLabelVisible) {
      featureLabelLayer.refreshSubset(observation.aircraft, "aircraft");
      featureLabelLayer.refreshSubset(observation.armies, "army");
      featureLabelLayer.refreshSubset(observation.ships, "ship");
      featureLabelLayer.refreshSubset(observation.facilities, "facility");
      featureLabelLayer.refreshSubset(observation.airbases, "airbase");
    }
    if (threatRangeVisible)
      threatRangeLayer.refresh([
        ...observation.armies,
        ...observation.facilities,
        ...observation.ships,
      ]);
    if (
      referencePointLayer.featureCount !== observation.referencePoints.length
    ) {
      referencePointLayer.refresh(observation.referencePoints);
      if (featureLabelVisible)
        featureLabelLayer.refreshSubset(
          observation.referencePoints,
          "referencePoint"
        );
    }
  }

  function setGamePaused() {
    game.scenarioPaused = true;
    setCurrentGameStatusToContext("시뮬레이션 일시정지");
  }

  function addAircraft(
    coordinates: number[],
    className?: string,
    speed?: number,
    maxFuel?: number,
    fuelRate?: number,
    range?: number
  ) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    className = className ?? "F-22Z";
    const aircraftName =
      getDisplayName(className) + " #" + randomInt(1, 5000).toString();
    const latitude = coordinates[1];
    const longitude = coordinates[0];
    const newAircraft = game.addAircraft(
      aircraftName,
      className,
      latitude,
      longitude,
      speed,
      maxFuel,
      fuelRate,
      range
    );
    if (newAircraft) {
      aircraftLayer.addAircraftFeature(newAircraft);
      handleFeatureEntityStateAction(
        {
          id: newAircraft.id,
          name: newAircraft.name,
          type: "aircraft",
          sideId: newAircraft.sideId,
          sideColor: newAircraft.sideColor,
        },
        "add"
      );
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(newAircraft);
    }
  }

  function addAircraftToAirbase(airbaseId: string, aircraftClassName: string) {
    const aircraftTemplate = unitDbContext
      .getAircraftDb()
      .find((aircraft) => aircraft.className === aircraftClassName);
    return game.addAircraftToAirbase(
      airbaseId,
      aircraftClassName,
      aircraftTemplate?.speed,
      aircraftTemplate?.maxFuel,
      aircraftTemplate?.fuelRate,
      aircraftTemplate?.range
    );
  }

  function removeAircraftFromAirbase(airbaseId: string, aircraftIds: string[]) {
    return game.removeAircraftFromAirbase(airbaseId, aircraftIds);
  }

  function addFacility(
    coordinates: number[],
    className?: string,
    range?: number,
    heading: number = 0
  ) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    className = className ?? "SAM";
    const facilityName =
      getDisplayName(className) + " #" + randomInt(1, 5000).toString();
    const latitude = coordinates[1];
    const longitude = coordinates[0];
    const newFacility = game.addFacility(
      facilityName,
      className,
      latitude,
      longitude,
      range,
      heading
    );
    if (newFacility) {
      facilityLayer.addFacilityFeature(newFacility);
      handleFeatureEntityStateAction(
        {
          id: newFacility.id,
          name: newFacility.name,
          type: "facility",
          sideId: newFacility.sideId,
          sideColor: newFacility.sideColor,
        },
        "add"
      );
      if (threatRangeVisible) threatRangeLayer.addRangeFeature(newFacility);
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(newFacility);
    }
    return newFacility;
  }

  function addAirbase(
    olCoordinates: number[],
    name?: string,
    realCoordinates?: number[]
  ) {
    const coordinates =
      realCoordinates ??
      toLonLat(olCoordinates, theMap.getView().getProjection());
    const airbaseName =
      getDisplayName(name ?? "Airfield") + " #" + randomInt(1, 5000).toString();
    const className = "Airfield";
    const latitude = coordinates[1];
    const longitude = coordinates[0];
    const newAirbase = game.addAirbase(
      airbaseName,
      className,
      latitude,
      longitude
    );
    if (newAirbase) {
      airbasesLayer.addAirbaseFeature(newAirbase);
      handleFeatureEntityStateAction(
        {
          id: newAirbase.id,
          name: newAirbase.name,
          type: "airbase",
          sideId: newAirbase.sideId,
          sideColor: newAirbase.sideColor,
        },
        "add"
      );
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(newAirbase);
    }
  }

  function removeAirbase(airbaseId: string) {
    game.removeAirbase(airbaseId);
    airbasesLayer.removeFeatureById(airbaseId);
    handleFeatureEntityStateAction({ id: airbaseId }, "remove");
    if (featureLabelVisible) featureLabelLayer.removeFeatureById(airbaseId);
  }

  function closeFeatureCard(feature: FeatureEntityState) {
    let cardClosed = false;

    if (
      feature.type === "airbase" &&
      openAirbaseCard.open &&
      openAirbaseCard.airbaseId === feature.id
    ) {
      setOpenAirbaseCard({
        open: false,
        top: 0,
        left: 0,
        airbaseId: "",
      });
      cardClosed = true;
    } else if (
      feature.type === "army" &&
      openArmyCard.open &&
      openArmyCard.armyId === feature.id
    ) {
      setOpenArmyCard({
        open: false,
        top: 0,
        left: 0,
        armyId: "",
      });
      cardClosed = true;
    } else if (
      feature.type === "facility" &&
      openFacilityCard.open &&
      openFacilityCard.facilityId === feature.id
    ) {
      setOpenFacilityCard({
        open: false,
        top: 0,
        left: 0,
        facilityId: "",
      });
      cardClosed = true;
    } else if (
      feature.type === "aircraft" &&
      openAircraftCard.open &&
      openAircraftCard.aircraftId === feature.id
    ) {
      setOpenAircraftCard({
        open: false,
        top: 0,
        left: 0,
        aircraftId: "",
      });
      cardClosed = true;
    } else if (
      feature.type === "ship" &&
      openShipCard.open &&
      openShipCard.shipId === feature.id
    ) {
      setOpenShipCard({
        open: false,
        top: 0,
        left: 0,
        shipId: "",
      });
      cardClosed = true;
    } else if (
      feature.type === "referencePoint" &&
      openReferencePointCard.open &&
      openReferencePointCard.referencePointId === feature.id
    ) {
      setOpenReferencePointCard({
        open: false,
        top: 0,
        left: 0,
        referencePointId: "",
      });
      cardClosed = true;
    }

    if (cardClosed) {
      setKeyboardShortcutsEnabled(true);
    }
  }

  function removeFacility(facilityId: string, skipGroupSync: boolean = false) {
    game.removeFacility(facilityId);
    facilityLayer.removeFeatureById(facilityId);
    threatRangeLayer.removeFeatureById(facilityId);
    handleFeatureEntityStateAction({ id: facilityId }, "remove");
    if (featureLabelVisible) featureLabelLayer.removeFeatureById(facilityId);
    if (!skipGroupSync) {
      loadFacilityPlacementGroupsFromScenario();
    }
  }

  function removeArmy(armyId: string) {
    game.removeArmy(armyId);
    armyLayer.removeFeatureById(armyId);
    armyRouteLayer.removeFeatureById(armyId);
    threatRangeLayer.removeFeatureById(armyId);
    handleFeatureEntityStateAction({ id: armyId }, "remove");
    if (featureLabelVisible) featureLabelLayer.removeFeatureById(armyId);
  }

  function removeAircraft(aircraftId: string) {
    game.removeAircraft(aircraftId);
    aircraftLayer.removeFeatureById(aircraftId);
    aircraftRouteLayer.removeFeatureById(aircraftId);
    handleFeatureEntityStateAction({ id: aircraftId }, "remove");
    if (featureLabelVisible) featureLabelLayer.removeFeatureById(aircraftId);
  }

  function addReferencePoint(coordinates: number[], name?: string) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    name = name ?? "참조점 #" + randomInt(1, 5000).toString();
    const newReferencePoint = game.addReferencePoint(
      name,
      coordinates[1],
      coordinates[0]
    );
    if (newReferencePoint) {
      referencePointLayer.addReferencePointFeature(newReferencePoint);
      handleFeatureEntityStateAction(
        {
          id: newReferencePoint.id,
          name: newReferencePoint.name,
          type: "referencePoint",
          sideId: newReferencePoint.sideId,
          sideColor: newReferencePoint.sideColor,
        },
        "add"
      );
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(newReferencePoint);
    }
  }

  function removeReferencePoint(referencePointId: string) {
    game.removeReferencePoint(referencePointId);
    referencePointLayer.removeFeatureById(referencePointId);
    handleFeatureEntityStateAction({ id: referencePointId }, "remove");
    if (featureLabelVisible)
      featureLabelLayer.removeFeatureById(referencePointId);
  }

  function handleDeleteFeatureEntity(feature: FeatureEntityState) {
    closeFeatureCard(feature);
    if (game.selectedUnitId === feature.id) {
      game.selectedUnitId = "";
    }

    switch (feature.type) {
      case "aircraft":
        removeAircraft(feature.id);
        break;
      case "airbase":
        removeAirbase(feature.id);
        break;
      case "army":
        removeArmy(feature.id);
        break;
      case "facility":
        removeFacility(feature.id);
        break;
      case "ship":
        removeShip(feature.id);
        break;
      case "referencePoint":
        removeReferencePoint(feature.id);
        break;
      default:
        break;
    }
  }

  function removeWeapon(weaponId: string) {
    game.removeWeapon(weaponId);
    weaponLayer.removeFeatureById(weaponId);
  }

  function addShip(
    coordinates: number[],
    className?: string,
    speed?: number,
    maxFuel?: number,
    fuelRate?: number,
    range?: number
  ) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    className = className ?? "Carrier";
    const shipName =
      getDisplayName(className) + " #" + randomInt(1, 5000).toString();
    const latitude = coordinates[1];
    const longitude = coordinates[0];
    const newShip = game.addShip(
      shipName,
      className,
      latitude,
      longitude,
      speed,
      maxFuel,
      fuelRate,
      range
    );
    if (newShip) {
      shipLayer.addShipFeature(newShip);
      handleFeatureEntityStateAction(
        {
          id: newShip.id,
          name: newShip.name,
          type: "ship",
          sideId: newShip.sideId,
          sideColor: newShip.sideColor,
        },
        "add"
      );
      if (threatRangeVisible) threatRangeLayer.addRangeFeature(newShip);
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(newShip);
    }
  }

  function addAircraftToShip(shipId: string, aircraftClassName: string) {
    const aircraftTemplate = unitDbContext
      .getAircraftDb()
      .find((aircraft) => aircraft.className === aircraftClassName);
    return game.addAircraftToShip(
      shipId,
      aircraftClassName,
      aircraftTemplate?.speed,
      aircraftTemplate?.maxFuel,
      aircraftTemplate?.fuelRate,
      aircraftTemplate?.range
    );
  }

  function removeAircraftFromShip(shipId: string, aircraftIds: string[]) {
    return game.removeAircraftFromShip(shipId, aircraftIds);
  }

  function removeShip(shipId: string) {
    game.removeShip(shipId);
    shipLayer.removeFeatureById(shipId);
    shipRouteLayer.removeFeatureById(shipId);
    threatRangeLayer.removeFeatureById(shipId);
    handleFeatureEntityStateAction({ id: shipId }, "remove");
    if (featureLabelVisible) featureLabelLayer.removeFeatureById(shipId);
  }

  function moveShip(shipId: string, coordinates: number[]) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    const destinationLatitude = coordinates[1];
    const destinationLongitude = coordinates[0];
    game.moveShip(shipId, destinationLatitude, destinationLongitude);
  }

  function moveArmy(armyId: string, coordinates: number[]) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    const destinationLatitude = coordinates[1];
    const destinationLongitude = coordinates[0];
    game.moveArmy(armyId, destinationLatitude, destinationLongitude);
  }

  function launchAircraftFromShip(shipId: string, aircraftIds: string[]) {
    const launchedAircraft = game.launchAircraftFromShip(shipId, aircraftIds);
    if (launchedAircraft.length > 0) {
      launchedAircraft.forEach((aircraft) => {
        aircraftLayer.addAircraftFeature(aircraft);
        if (featureLabelVisible)
          featureLabelLayer.addFeatureLabelFeature(aircraft);
      });
    }
    let shipAircraft: Aircraft[] = [];
    const ship = game.currentScenario.getShip(shipId);
    if (ship) {
      shipAircraft = ship.aircraft;
    }
    return shipAircraft;
  }

  function moveAircraft(aircraftId: string, coordinates: number[]) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    const destinationLatitude = coordinates[1];
    const destinationLongitude = coordinates[0];
    game.moveAircraft(aircraftId, destinationLatitude, destinationLongitude);
  }

  function teleportUnit(unitId: string, coordinates: number[]) {
    coordinates = toLonLat(coordinates, theMap.getView().getProjection());
    const destinationLatitude = coordinates[1];
    const destinationLongitude = coordinates[0];
    const teleportedUnit = game.teleportUnit(
      unitId,
      destinationLatitude,
      destinationLongitude
    );
    if (teleportedUnit) refreshAllLayers();
  }

  function launchAircraftFromAirbase(airbaseId: string, aircraftIds: string[]) {
    const launchedAircraft = game.launchAircraftFromAirbase(
      airbaseId,
      aircraftIds
    );
    if (launchedAircraft.length > 0) {
      launchedAircraft.forEach((aircraft) => {
        aircraftLayer.addAircraftFeature(aircraft);
        if (featureLabelVisible)
          featureLabelLayer.addFeatureLabelFeature(aircraft);
      });
    }
    let airbaseAircraft: Aircraft[] = [];
    const airbase = game.currentScenario.getAirbase(airbaseId);
    if (airbase) {
      airbaseAircraft = airbase.aircraft;
    }
    return airbaseAircraft;
  }

  function resetAttack() {
    game.selectingTarget = false;
    game.currentAttackParams = {
      autoAttack: false,
      currentAttackerId: "",
      currentWeaponId: "",
      currentWeaponQuantity: 0,
    };
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
    changeCursorType("");
  }

  function handleAircraftAttack(
    aircraftId: string,
    weaponId: string,
    weaponQuantity: number = 1
  ) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: false,
      currentAttackerId: aircraftId,
      currentWeaponId: weaponId,
      currentWeaponQuantity: weaponQuantity,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function handleShipAttack(
    shipId: string,
    weaponId: string,
    weaponQuantity: number = 1
  ) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: false,
      currentAttackerId: shipId,
      currentWeaponId: weaponId,
      currentWeaponQuantity: weaponQuantity,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function handleAircraftAutoAttack(aircraftId: string) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: true,
      currentAttackerId: aircraftId,
      currentWeaponId: "",
      currentWeaponQuantity: 0,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function handleShipAutoAttack(shipId: string) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: true,
      currentAttackerId: shipId,
      currentWeaponId: "",
      currentWeaponQuantity: 0,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function handleArmyAttack(
    armyId: string,
    weaponId: string,
    weaponQuantity: number
  ) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: false,
      currentAttackerId: armyId,
      currentWeaponId: weaponId,
      currentWeaponQuantity: weaponQuantity,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function handleArmyAutoAttack(armyId: string) {
    game.selectingTarget = true;
    game.currentAttackParams = {
      autoAttack: true,
      currentAttackerId: armyId,
      currentWeaponId: "",
      currentWeaponQuantity: 0,
    };
    setCurrentGameStatusToContext("공격할 적 표적을 선택하세요.");
    changeCursorType("crosshair");
  }

  function queueAircraftForMovement(aircraftId: string) {
    game.selectedUnitId = aircraftId;
    const aircraft = game.currentScenario.getAircraft(aircraftId);
    if (aircraft) {
      aircraft.selected = true;
      aircraftLayer.updateAircraftFeature(
        aircraft.id,
        aircraft.selected,
        aircraft.heading
      );
      addRouteMeasurementInteraction(
        fromLonLat(
          [aircraft.longitude, aircraft.latitude],
          projection ?? defaultProjection!
        ),
        aircraft.sideColor
      );
      aircraft.rtb = false;
      setCurrentGameStatusToContext(
        "지도를 클릭해 항로를 지정하세요. 같은 지점을 두 번 클릭하거나 Esc를 누르면 종료됩니다."
      );
    }
  }

  function queueShipForMovement(shipId: string) {
    game.selectedUnitId = shipId;
    const ship = game.currentScenario.getShip(shipId);
    if (ship) {
      ship.selected = true;
      shipLayer.updateShipFeature(ship.id, ship.selected, ship.heading);
      shipRouteLayer.removeFeatureById(ship.id);
      addRouteMeasurementInteraction(
        fromLonLat(
          [ship.longitude, ship.latitude],
          projection ?? defaultProjection!
        ),
        ship.sideColor
      );
      setCurrentGameStatusToContext(
        "지도를 클릭해 함정 항로를 지정하세요. 같은 지점을 두 번 클릭하거나 Esc를 누르면 종료됩니다."
      );
    }
  }

  function queueArmyForMovement(armyId: string) {
    game.selectedUnitId = armyId;
    const army = game.currentScenario.getArmy(armyId);
    if (army) {
      army.selected = true;
      armyLayer.updateArmyFeature(army.id, army.selected, army.heading);
      armyRouteLayer.removeFeatureById(army.id);
      addRouteMeasurementInteraction(
        fromLonLat(
          [army.longitude, army.latitude],
          projection ?? defaultProjection!
        ),
        army.sideColor
      );
      setCurrentGameStatusToContext(
        "지도를 클릭해 지상군 항로를 지정하세요. 같은 지점을 두 번 클릭하거나 Esc를 누르면 종료됩니다."
      );
    }
  }

  function handleAircraftRtb(aircraftId: string) {
    const aircraftReturningToBase = game.aircraftReturnToBase(aircraftId);
    if (aircraftReturningToBase) {
      if (aircraftReturningToBase.route.length === 0)
        aircraftRouteLayer.removeFeatureById(aircraftId);
      else aircraftRouteLayer.addRouteFeature(aircraftReturningToBase);
    }
  }

  function handleDuplicateAircraft(aircraftId: string) {
    const duplicatedAircraft = game.duplicateUnit(aircraftId, "aircraft");
    if (duplicatedAircraft) {
      aircraftLayer.addAircraftFeature(duplicatedAircraft);
      if (featureLabelVisible)
        featureLabelLayer.addFeatureLabelFeature(duplicatedAircraft);
    }
  }

  function handleAddWeaponToAircraft(
    aircraftId: string,
    weaponClassName: string
  ) {
    const weaponTemplate = unitDbContext
      .getWeaponDb()
      .find((weapon) => weapon.className === weaponClassName);
    return game.currentScenario.addWeaponToAircraft(
      aircraftId,
      weaponTemplate?.className,
      weaponTemplate?.speed, // in knots
      weaponTemplate?.maxFuel,
      weaponTemplate?.fuelRate, // in lbs/hr
      weaponTemplate?.lethality
    );
  }

  function handleDeleteWeaponFromAircraft(
    aircraftId: string,
    weaponId: string
  ) {
    return game.currentScenario.deleteWeaponFromAircraft(aircraftId, weaponId);
  }

  function handleUpdateAircraftWeaponQuantity(
    aircraftId: string,
    weaponId: string,
    increment: number
  ) {
    return game.currentScenario.updateAircraftWeaponQuantity(
      aircraftId,
      weaponId,
      increment
    );
  }

  function handleAddWeaponToFacility(
    facilityId: string,
    weaponClassName: string
  ) {
    const weaponTemplate = unitDbContext
      .getWeaponDb()
      .find((weapon) => weapon.className === weaponClassName);
    return game.currentScenario.addWeaponToFacility(
      facilityId,
      weaponTemplate?.className,
      weaponTemplate?.speed, // in knots
      weaponTemplate?.maxFuel,
      weaponTemplate?.fuelRate, // in lbs/hr
      weaponTemplate?.lethality
    );
  }

  function handleDeleteWeaponFromFacility(
    facilityId: string,
    weaponId: string
  ) {
    return game.currentScenario.deleteWeaponFromFacility(facilityId, weaponId);
  }

  function handleUpdateFacilityWeaponQuantity(
    facilityId: string,
    weaponId: string,
    increment: number
  ) {
    return game.currentScenario.updateFacilityWeaponQuantity(
      facilityId,
      weaponId,
      increment
    );
  }

  function handleAddWeaponToArmy(armyId: string, weaponClassName: string) {
    const weaponTemplate = unitDbContext
      .getWeaponDb()
      .find((weapon) => weapon.className === weaponClassName);
    return game.currentScenario.addWeaponToArmy(
      armyId,
      weaponTemplate?.className,
      weaponTemplate?.speed,
      weaponTemplate?.maxFuel,
      weaponTemplate?.fuelRate,
      weaponTemplate?.lethality
    );
  }

  function handleDeleteWeaponFromArmy(armyId: string, weaponId: string) {
    return game.currentScenario.deleteWeaponFromArmy(armyId, weaponId);
  }

  function handleUpdateArmyWeaponQuantity(
    armyId: string,
    weaponId: string,
    increment: number
  ) {
    return game.currentScenario.updateArmyWeaponQuantity(
      armyId,
      weaponId,
      increment
    );
  }

  function handleAddWeaponToShip(shipId: string, weaponClassName: string) {
    const weaponTemplate = unitDbContext
      .getWeaponDb()
      .find((weapon) => weapon.className === weaponClassName);
    return game.currentScenario.addWeaponToShip(
      shipId,
      weaponTemplate?.className,
      weaponTemplate?.speed, // in knots
      weaponTemplate?.maxFuel,
      weaponTemplate?.fuelRate, // in lbs/hr
      weaponTemplate?.lethality
    );
  }

  function handleDeleteWeaponFromShip(shipId: string, weaponId: string) {
    return game.currentScenario.deleteWeaponFromShip(shipId, weaponId);
  }

  function handleUpdateShipWeaponQuantity(
    shipId: string,
    weaponId: string,
    increment: number
  ) {
    return game.currentScenario.updateShipWeaponQuantity(
      shipId,
      weaponId,
      increment
    );
  }

  function handleCreatePatrolMission(
    missionName: string,
    assignedUnits: string[],
    referencePoints: string[]
  ) {
    if (referencePoints.length < 3) return;
    const assignedArea = [];
    for (const referencePointId of referencePoints) {
      const referencePoint =
        game.currentScenario.getReferencePoint(referencePointId);
      if (referencePoint) {
        assignedArea.push(referencePoint);
      }
    }
    game.createPatrolMission(missionName, assignedUnits, assignedArea);
    toastContext?.addToast(
      `초계 임무 [${missionName}]를 생성했습니다.`,
      "success"
    );
  }

  function handleUpdatePatrolMission(
    missionId: string,
    missionName?: string,
    assignedUnits?: string[],
    referencePoints?: string[]
  ) {
    if (referencePoints && referencePoints.length < 3) return;
    const assignedArea = [];
    if (referencePoints) {
      for (const referencePointId of referencePoints) {
        const referencePoint =
          game.currentScenario.getReferencePoint(referencePointId);
        if (referencePoint) {
          assignedArea.push(referencePoint);
        }
      }
    }
    game.updatePatrolMission(
      missionId,
      missionName,
      assignedUnits,
      assignedArea
    );
    toastContext?.addToast(
      `초계 임무 [${missionName}]를 수정했습니다.`,
      "success"
    );
  }

  function handleCreateStrikeMission(
    missionName: string,
    assignedUnits: string[],
    targetIds: string[]
  ) {
    game.createStrikeMission(missionName, assignedUnits, targetIds);
    toastContext?.addToast(
      `타격 임무 [${missionName}]를 생성했습니다.`,
      "success"
    );
  }

  function handleUpdateStrikeMission(
    missionId: string,
    missionName?: string,
    assignedUnits?: string[],
    targetIds?: string[]
  ) {
    game.updateStrikeMission(missionId, missionName, assignedUnits, targetIds);
    toastContext?.addToast(
      `타격 임무 [${missionName}]를 수정했습니다.`,
      "success"
    );
  }

  function handleDeleteMission(missionId: string) {
    game.deleteMission(missionId);
    toastContext?.addToast(`임무를 삭제했습니다.`, "success");
  }

  function openMissionCreator(
    initialMissionType: "Patrol" | "Strike" = "Patrol",
    initialTargetIds: string[] = []
  ) {
    setKeyboardShortcutsEnabled(false);
    setMissionCreatorInitialMissionType(initialMissionType);
    setMissionCreatorInitialTargetIds(initialTargetIds);
    setMissionCreatorActive(true);
  }

  function closeMissionCreator() {
    setKeyboardShortcutsEnabled(true);
    setMissionCreatorInitialMissionType("Patrol");
    setMissionCreatorInitialTargetIds([]);
    setMissionCreatorActive(false);
  }

  function openMissionEditor(selectedMissionId: string = "") {
    const currentSideId = game.currentScenario.getSide(game.currentSideId)?.id;
    if (
      selectedMissionId !== "" &&
      game.currentScenario.missions.filter(
        (mission) =>
          mission.sideId === currentSideId && mission.id === selectedMissionId
      ).length === 0
    )
      return;
    setKeyboardShortcutsEnabled(false);
    setMissionEditorActive({
      open: true,
      selectedMissionId: selectedMissionId,
    });
  }

  function closeMissionEditor() {
    setKeyboardShortcutsEnabled(true);
    setMissionEditorActive({
      open: false,
      selectedMissionId: "",
    });
  }

  function openSimulationLogs() {
    setSimulationLogsActive(true);
  }

  function closeSimulationLogs() {
    setSimulationLogsActive(false);
  }

  function updateCurrentSimulationLogsToContext(options?: {
    announceLiveCommentary?: boolean;
    clearExistingLiveCommentary?: boolean;
  }) {
    if (!game.simulationLogs.getHasNewLogs()) {
      if (options?.clearExistingLiveCommentary) {
        clearLiveCommentaryNotifications();
      }
      return;
    }

    const logs = [...game.simulationLogs.getLogs()];
    setCurrentSimulationLogsToContext(logs);
    syncLiveCommentaryNotifications(logs, options);
    game.simulationLogs.setHasNewLogs(false);
  }

  function handleOpenSideEditor(sideId: string | null) {
    const anchorEl = document.getElementById("side-select");
    if (!anchorEl) return;
    setKeyboardShortcutsEnabled(false);
    setOpenSideEditor({
      open: true,
      sideId: sideId,
      anchorEl: anchorEl,
    });
  }

  function handleCloseSideEditor() {
    setOpenSideEditor({
      open: false,
      anchorEl: null,
      sideId: null,
    });
    setKeyboardShortcutsEnabled(true);
  }

  function handleAddSide(
    sideName: string,
    sideColor: SIDE_COLOR,
    sideHostiles: string[],
    sideAllies: string[],
    sideDoctrine: SideDoctrine
  ) {
    game.addSide(sideName, sideColor, sideHostiles, sideAllies, sideDoctrine);
    if (game.currentScenario.sides.length === 1) {
      switchCurrentSide(game.currentScenario.sides[0].id);
    }
  }

  function handleUpdateSide(
    sideId: string,
    sideName: string,
    sideColor: SIDE_COLOR,
    sideHostiles: string[],
    sideAllies: string[],
    sideDoctrine: SideDoctrine
  ) {
    game.updateSide(
      sideId,
      sideName,
      sideColor,
      sideHostiles,
      sideAllies,
      sideDoctrine
    );
    refreshAllLayers();
    loadFeatureEntitiesState();
  }

  function handleDeleteSide(sideId: string) {
    game.deleteSide(sideId);
    if (game.currentScenario.sides.length > 0) {
      switchCurrentSide(game.currentSideId);
    } else if (game.currentScenario.sides.length === 0) {
      switchCurrentSide("");
    }
    refreshAllLayers();
    loadFeatureEntitiesState();
  }

  function queueUnitForTeleport(unitId: string) {
    clearPendingFacilityGroupTeleport();
    game.selectedUnitId = unitId;
    teleportingUnitRef.current = true;
    setCurrentGameStatusToContext("지도를 클릭해 유닛 위치를 이동하세요.");
  }

  function switchCurrentSide(sideId: string) {
    if (missionEditorActive.open) closeMissionEditor();
    game.switchCurrentSide(sideId);
    setCurrentSideId(game.currentSideId);
    toastContext?.addToast(
      `선택 세력: ${game.currentScenario.getSideName(game.currentSideId)}`
    );
  }

  function toggleScenarioTimeCompression() {
    game.switchScenarioTimeCompression();
    setCurrentScenarioTimeCompression(game.currentScenario.timeCompression);
  }

  function refreshAllLayers() {
    aircraftLayer.refresh(game.currentScenario.aircraft);
    armyLayer.refresh(game.currentScenario.armies);
    facilityLayer.refresh(game.currentScenario.facilities);
    airbasesLayer.refresh(game.currentScenario.airbases);
    if (threatRangeVisible)
      threatRangeLayer.refresh([
        ...game.currentScenario.armies,
        ...game.currentScenario.facilities,
        ...game.currentScenario.ships,
      ]);
    refreshFacilityPlacementGroupLayer();
    refreshWeaponTrajectoryLayer(game.currentScenario);
    weaponLayer.refresh(game.currentScenario.weapons);
    shipLayer.refresh(game.currentScenario.ships);
    referencePointLayer.refresh(game.currentScenario.referencePoints);
    if (featureLabelVisible) refreshFeatureLabelLayer();
    if (routeVisible) refreshRouteLayer(game.currentScenario);
  }

  function refreshFeatureLabelLayer() {
    featureLabelLayer.refresh([
      ...game.currentScenario.aircraft,
      ...game.currentScenario.armies,
      ...game.currentScenario.facilities,
      ...game.currentScenario.airbases,
      ...game.currentScenario.ships,
      ...game.currentScenario.referencePoints,
    ]);
  }

  function refreshThreatRangeLayer() {
    threatRangeLayer.refresh([
      ...game.currentScenario.armies,
      ...game.currentScenario.facilities,
      ...game.currentScenario.ships,
    ]);
  }

  function getEmphasizedFacilityPlacementGroupIds() {
    const emphasizedGroupIds = new Set<string>();
    const focusedFacility = openFacilityCard.open
      ? game.currentScenario.getFacility(openFacilityCard.facilityId)
      : undefined;
    const focusedFacilityGroup = focusedFacility
      ? findFacilityPlacementGroupByFacilityId(
          facilityPlacementGroups,
          focusedFacility.id
        )
      : null;
    if (focusedFacilityGroup) {
      emphasizedGroupIds.add(focusedFacilityGroup.id);
    }
    const dragSelectedGroup =
      dragSelectedFeatures.length > 0 &&
      dragSelectedFeatures.every(
        (feature) => feature.get("type") === "facility"
      )
        ? resolveMatchingFacilityPlacementGroup(
            facilityPlacementGroups,
            dragSelectedFeatures
              .map((feature) => feature.get("id"))
              .filter((id): id is string => typeof id === "string")
          )
        : null;
    if (dragSelectedGroup) {
      emphasizedGroupIds.add(dragSelectedGroup.id);
    }
    if (teleportingFacilityGroupIdRef.current) {
      emphasizedGroupIds.add(teleportingFacilityGroupIdRef.current);
    }
    return emphasizedGroupIds;
  }

  function refreshFacilityPlacementGroupLayer() {
    facilityPlacementGroupLayer.refresh(
      facilityPlacementGroups,
      game.currentScenario.facilities,
      getEmphasizedFacilityPlacementGroupIds()
    );
  }

  function refreshRouteLayer(observation: Scenario) {
    if (
      !observation.getAircraft(game.selectedUnitId) &&
      !observation.getArmy(game.selectedUnitId) &&
      !observation.getShip(game.selectedUnitId)
    ) {
      cleanUpRouteDrawLineAndMeasurementTooltip();
      aircraftRouteLayer.refresh(observation.aircraft);
      armyRouteLayer.refresh(observation.armies);
      shipRouteLayer.refresh(observation.ships);
      return;
    }
    aircraftRouteLayer.refresh(observation.aircraft);
    armyRouteLayer.refresh(observation.armies);
    shipRouteLayer.refresh(observation.ships);
  }

  function updateMapView(center: number[], zoom: number) {
    theMap
      .getView()
      .setCenter(transform(center, "EPSG:4326", DEFAULT_OL_PROJECTION_CODE));
    theMap.getView().setZoom(zoom);
  }

  function updateAircraft(
    aircraftId: string,
    aircraftName: string,
    aircraftClassName: string,
    aircraftSpeed: number,
    aircraftCurrentFuel: number,
    aircraftFuelRate: number,
    aircraftRange: number
  ) {
    game.currentScenario.updateAircraft(
      aircraftId,
      aircraftName,
      aircraftClassName,
      aircraftSpeed,
      aircraftCurrentFuel,
      aircraftFuelRate,
      aircraftRange
    );
    featureLabelLayer.updateFeatureLabelFeature(aircraftId, aircraftName);
  }

  function updateFacility(
    facilityId: string,
    facilityName: string,
    facilityClassName: string,
    facilityRange: number
  ) {
    game.currentScenario.updateFacility(
      facilityId,
      facilityName,
      facilityClassName,
      facilityRange
    );
    if (threatRangeVisible) {
      refreshThreatRangeLayer();
    }
    featureLabelLayer.updateFeatureLabelFeature(facilityId, facilityName);
  }

  function updateArmy(
    armyId: string,
    armyName: string,
    armyClassName: string,
    armySpeed: number,
    armyCurrentFuel: number,
    armyRange: number
  ) {
    game.currentScenario.updateArmy(
      armyId,
      armyName,
      armyClassName,
      armySpeed,
      armyCurrentFuel,
      armyRange
    );
    if (threatRangeVisible) {
      refreshThreatRangeLayer();
    }
    featureLabelLayer.updateFeatureLabelFeature(armyId, armyName);
  }

  function updateAirbase(airbaseId: string, airbaseName: string) {
    game.currentScenario.updateAirbase(airbaseId, airbaseName);
    featureLabelLayer.updateFeatureLabelFeature(airbaseId, airbaseName);
  }

  function updateShip(
    shipId: string,
    shipName: string,
    shipClassName: string,
    shipSpeed: number,
    shipCurrentFuel: number,
    shipRange: number
  ) {
    game.currentScenario.updateShip(
      shipId,
      shipName,
      shipClassName,
      shipSpeed,
      shipCurrentFuel,
      shipRange
    );
    if (threatRangeVisible) {
      refreshThreatRangeLayer();
    }
    featureLabelLayer.updateFeatureLabelFeature(shipId, shipName);
  }

  function updateReferencePoint(
    referencePointId: string,
    referencePointName: string
  ) {
    game.currentScenario.updateReferencePoint(
      referencePointId,
      referencePointName
    );
    featureLabelLayer.updateFeatureLabelFeature(
      referencePointId,
      referencePointName
    );
  }

  function toggleFeatureLabelVisibility(on: boolean) {
    setFeatureLabelVisible(on);
    if (on) {
      refreshFeatureLabelLayer();
      featureLabelLayer.layer.setVisible(true);
    } else {
      featureLabelLayer.layer.setVisible(false);
    }
  }

  function toggleThreatRangeVisibility(on: boolean) {
    setThreatRangeVisible(on);
    if (on) {
      refreshThreatRangeLayer();
      threatRangeLayer.layer.setVisible(true);
    } else {
      threatRangeLayer.layer.setVisible(false);
    }
  }

  function toggleRouteVisibility(on: boolean) {
    setRouteVisible(on);
    if (on) {
      refreshRouteLayer(game.currentScenario);
      aircraftRouteLayer.layer.setVisible(true);
      armyRouteLayer.layer.setVisible(true);
      shipRouteLayer.layer.setVisible(true);
    } else {
      aircraftRouteLayer.layer.setVisible(false);
      armyRouteLayer.layer.setVisible(false);
      shipRouteLayer.layer.setVisible(false);
    }
  }

  function refreshWeaponTrajectoryLayer(observation: Scenario) {
    if (!weaponTrajectoryVisible) {
      return;
    }

    weaponTrajectoryLayer.refresh(observation.weapons, observation);
  }

  function toggleWeaponTrajectoryVisibility(on: boolean) {
    setWeaponTrajectoryVisible(on);
    if (on) {
      weaponTrajectoryLayer.refresh(
        game.currentScenario.weapons,
        game.currentScenario
      );
      weaponTrajectoryLayer.layer.setVisible(true);
    } else {
      weaponTrajectoryLayer.refresh([], game.currentScenario);
      weaponTrajectoryLayer.layer.setVisible(false);
    }
  }

  function toggleReferencePointVisibility(on: boolean) {
    setReferencePointVisible(on);
    let referencePointsToRefresh: ReferencePoint[] = [];
    if (on) {
      referencePointLayer.layer.setVisible(true);
      referencePointsToRefresh = game.currentScenario.referencePoints;
    } else {
      referencePointLayer.layer.setVisible(false);
    }
    featureLabelLayer.refresh([
      ...game.currentScenario.aircraft,
      ...game.currentScenario.armies,
      ...game.currentScenario.facilities,
      ...game.currentScenario.airbases,
      ...game.currentScenario.ships,
      ...referencePointsToRefresh,
    ]);
  }

  function toggleBaseMapLayer() {
    baseMapLayers.toggleLayer();
    baseMapModeIdRef.current = baseMapLayers.getCurrentModeId();
    setBaseMapModeId(baseMapLayers.getCurrentModeId());
  }

  function createRouteMeasurementTooltip() {
    if (routeMeasurementTooltipElementRef.current) {
      routeMeasurementTooltipElementRef.current.parentNode?.removeChild(
        routeMeasurementTooltipElementRef.current
      );
    }
    routeMeasurementTooltipElementRef.current = document.createElement("div");
    routeMeasurementTooltipElementRef.current.className = "ol-tooltip ol-tooltip-measure";
    routeMeasurementTooltipRef.current = new Overlay({
      element: routeMeasurementTooltipElementRef.current,
      offset: [0, -15],
      positioning: "bottom-center",
      stopEvent: false,
      insertFirst: false,
    });
    theMap.addOverlay(routeMeasurementTooltipRef.current);
  }

  function finishRouteDrawLine() {
    if (selectingFocusFireObjective) {
      setSelectingFocusFireObjective(false);
      changeCursorType("");
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
    }
    theMap.getInteractions().forEach((interaction) => {
      if (interaction instanceof Draw) {
        interaction.finishDrawing();
      }
    });
  }

  function cleanUpRouteDrawLineAndMeasurementTooltip() {
    if (routeMeasurementDrawLineRef.current)
      theMap.removeInteraction(routeMeasurementDrawLineRef.current);
    routeMeasurementDrawLineRef.current = null;
    theMap.getInteractions().forEach((interaction) => {
      if (interaction instanceof Draw) {
        theMap.removeInteraction(interaction);
      }
    });
    if (routeMeasurementTooltipElementRef.current) {
      routeMeasurementTooltipElementRef.current.parentNode?.removeChild(
        routeMeasurementTooltipElementRef.current
      );
    }
    if (routeMeasurementTooltipRef.current) theMap.removeOverlay(routeMeasurementTooltipRef.current);
    theMap.getOverlays().forEach((overlay) => {
      if (overlay.getElement()?.innerHTML.slice(-2) === "NM") {
        theMap.removeOverlay(overlay);
      }
    });
    routeMeasurementTooltipElementRef.current = null;
    routeMeasurementTooltipRef.current = null;
    if (routeMeasurementListenerRef.current) unByKey(routeMeasurementListenerRef.current);
  }

  const formatRouteLengthDisplay = function (line: LineString) {
    const length = getLength(line, {
      projection: projection ?? defaultProjection!,
    });
    const output = (length / NAUTICAL_MILES_TO_METERS).toFixed(2) + " " + "NM";
    return output;
  };

  function handleRouteDrawEnd() {
    cleanUpRouteDrawLineAndMeasurementTooltip();
    const aircraft = game.currentScenario.getAircraft(game.selectedUnitId);
    if (aircraft) {
      aircraft.selected = !aircraft.selected;
      aircraftLayer.updateAircraftFeature(
        aircraft.id,
        aircraft.selected,
        aircraft.heading
      );
    }
    const ship = game.currentScenario.getShip(game.selectedUnitId);
    if (ship) {
      ship.selected = !ship.selected;
      shipLayer.updateShipFeature(ship.id, ship.selected, ship.heading);
    }
    const army = game.currentScenario.getArmy(game.selectedUnitId);
    if (army) {
      army.selected = !army.selected;
      armyLayer.updateArmyFeature(army.id, army.selected, army.heading);
    }
    game.commitRoute(game.selectedUnitId);
    game.selectedUnitId = "";
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
    refreshRouteLayer(game.currentScenario);
  }

  function addRouteMeasurementInteraction(

    startCoordinates: number[],
    sideColor: string | SIDE_COLOR | undefined = undefined
  ) {
    routeMeasurementDrawLineRef.current = new Draw({
      source: new VectorSource(),
      type: "LineString",
      style: routeDrawLineStyle,
    });

    theMap.addInteraction(routeMeasurementDrawLineRef.current);

    createRouteMeasurementTooltip();

    routeMeasurementDrawLineRef.current.on("drawstart", function (event) {
      const drawLineFeature = event.feature;
      drawLineFeature.setProperties({
        sideColor: convertColorNameToSideColor(sideColor),
      });
      routeMeasurementListenerRef.current = drawLineFeature
        .getGeometry()
        ?.on("change", function (event) {
          const geom = event.target as LineString;
          const firstPoint = geom.getFirstCoordinate();
          const lastPoint = geom.getLastCoordinate();
          const tooltipCoord = [
            (firstPoint[0] + lastPoint[0]) / 2,
            (firstPoint[1] + lastPoint[1]) / 2,
          ];
          if (routeMeasurementTooltipElementRef.current) {
            routeMeasurementTooltipElementRef.current.innerHTML =
              formatRouteLengthDisplay(geom);
            routeMeasurementTooltipElementRef.current.style.color =
              convertColorNameToSideColor(sideColor);
            routeMeasurementTooltipElementRef.current.style.fontWeight = "bold";
          }
          routeMeasurementTooltipRef.current?.setPosition(tooltipCoord);
        });
    });

    routeMeasurementDrawLineRef.current.on("drawend", function (_event) {
      handleRouteDrawEnd();
    });

    routeMeasurementDrawLineRef.current.appendCoordinates([startCoordinates]);
  }

  return {
    addAirbase, addAircraft, addAircraftToAirbase,
    addAircraftToShip, addFacility, addReferencePoint,
    addRouteMeasurementInteraction, addShip, cleanUpRouteDrawLineAndMeasurementTooltip,
    closeFeatureCard, closeMissionCreator, closeMissionEditor,
    closeSimulationLogs, createRouteMeasurementTooltip, drawNextFrame,
    finishRouteDrawLine, formatRouteLengthDisplay, getEmphasizedFacilityPlacementGroupIds,
    handleAddSide, handleAddWeaponToAircraft, handleAddWeaponToArmy,
    handleAddWeaponToFacility, handleAddWeaponToShip, handleAircraftAttack,
    handleAircraftAutoAttack, handleAircraftRtb, handleArmyAttack,
    handleArmyAutoAttack, handleCloseSideEditor, handleCreatePatrolMission,
    handleCreateStrikeMission, handleDeleteFeatureEntity, handleDeleteMission,
    handleDeleteSide, handleDeleteWeaponFromAircraft, handleDeleteWeaponFromArmy,
    handleDeleteWeaponFromFacility, handleDeleteWeaponFromShip, handleDuplicateAircraft,
    handleOpenSideEditor, handleRouteDrawEnd, handleShipAttack,
    handleShipAutoAttack, handleUpdateAircraftWeaponQuantity, handleUpdateArmyWeaponQuantity,
    handleUpdateFacilityWeaponQuantity, handleUpdatePatrolMission, handleUpdateShipWeaponQuantity,
    handleUpdateSide, handleUpdateStrikeMission, launchAircraftFromAirbase,
    launchAircraftFromShip, moveAircraft, moveArmy,
    moveShip, openMissionCreator, openMissionEditor,
    openSimulationLogs, queueAircraftForMovement, queueArmyForMovement,
    queueShipForMovement, queueUnitForTeleport, refreshAllLayers,
    refreshFacilityPlacementGroupLayer, refreshFeatureLabelLayer, refreshRouteLayer,
    refreshThreatRangeLayer, refreshWeaponTrajectoryLayer, removeAirbase,
    removeAircraft, removeAircraftFromAirbase, removeAircraftFromShip,
    removeArmy, removeFacility, removeReferencePoint,
    removeShip, removeWeapon, resetAttack,
    setGamePaused, stepGameAndDrawFrame, stepGameForStepSize,
    switchCurrentSide, teleportUnit, toggleBaseMapLayer,
    toggleFeatureLabelVisibility, toggleReferencePointVisibility, toggleRouteVisibility,
    toggleScenarioTimeCompression, toggleThreatRangeVisibility, toggleWeaponTrajectoryVisibility,
    updateAirbase, updateAircraft, updateArmy,
    updateCurrentSimulationLogsToContext, updateFacility, updateMapView,
    updateReferencePoint, updateShip,
  };
}

