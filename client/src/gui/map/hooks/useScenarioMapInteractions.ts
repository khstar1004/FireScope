// @ts-nocheck

export function useScenarioMapInteractions(ctx) {
  const {
    BaseVectorLayer, GAME_SPEED_DELAY_MS, VectorLayer,
    addAirbase, addAircraft, addFacility,
    addReferencePoint, addShip, aircraftLayer,
    armyLayer, buildSimulationOutcomeSummary, clearPendingFacilityGroupTeleport,
    clearPendingFacilityPlacement, clearRlCheckpointSpectatorSession, defaultProjection,
    delay, drawNextFrame, facilityPlacementDefaultsRef,
    featureEntitiesState, fixedTargetStrikeRlDemo, fromLonLat,
    game, getPendingFacilityPlacementPreviews, getReplayMetricForStep,
    loadFacilityPlacementGroupsFromScenario, loadRecordingContent, moveAircraft,
    moveArmy, moveShip, openFlightSimPage,
    pendingFacilityPlacement, pendingFacilityPlacementRef, projection,
    refreshAllLayers, registerFacilityPlacementGroup, removeAirbase,
    removeAircraft, removeArmy, removeFacility,
    removeReferencePoint, removeShip, removeWeapon,
    requestSimulationOutcomeNarrative, resetAttack, routeMeasurementDrawLineRef,
    scenarioMapActiveRef, selectFacilityPlacementGroup, selectingFocusFireObjective,
    setActiveReplayMetric, setCurrentGameStatusToContext, setCurrentRecordingIntervalSeconds,
    setCurrentRecordingStepToContext, setCurrentScenarioTimeToContext, setDragSelectedFeatures,
    setFeatureEntitiesState, setFocusFireDockOpen, setGamePaused,
    setIsGameOver, setKeyboardShortcutsEnabled, setOpenAirbaseCard,
    setOpenAircraftCard, setOpenArmyCard, setOpenFacilityCard,
    setOpenMapContextMenu, setOpenMultipleFeatureSelector, setOpenReferencePointCard,
    setOpenShipCard, setOpenTargetFireRecommendation, setOpenWeaponCard,
    setPendingFacilityPlacement, setSelectedDragRecommendationTargetId, setSelectingFocusFireObjective,
    setSimulationOutcomeLoading, setSimulationOutcomeNarrative, setSimulationOutcomeNarrativeSource,
    setSimulationOutcomeSummary, setTerrain3dSelectionActive, shipLayer,
    shouldRunScenarioImmediatelyAfterLaunchModeSelection, simulationOutcomeRequestIdRef, stepGameAndDrawFrame,
    teleportFacilityPlacementGroup, teleportUnit, teleportingFacilityGroupIdRef,
    teleportingUnitRef, terrain3dSelectionActive, theMap,
    toLonLat, toastContext, unitDbContext,
    updateCurrentSimulationLogsToContext, updatePendingFacilityPlacementPreview, useEffect,
  } = ctx;

  function changeCursorType(cursorType: string = "") {
    if (theMap) {
      theMap.getViewport().style.cursor = cursorType;
    }
  }

  useEffect(() => {
    changeCursorType(terrain3dSelectionActive ? "crosshair" : "");

    return () => {
      changeCursorType("");
    };
  }, [terrain3dSelectionActive, theMap]);

  useEffect(() => {
    if (!terrain3dSelectionActive) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTerrain3dSelectionActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [terrain3dSelectionActive]);

  function resolveTerrain3dBounds(extent: number[]): Terrain3dBounds {
    const sourceProjection = projection ?? defaultProjection ?? undefined;
    const southwest = toLonLat([extent[0], extent[1]], sourceProjection);
    const southeast = toLonLat([extent[2], extent[1]], sourceProjection);
    const northwest = toLonLat([extent[0], extent[3]], sourceProjection);
    const northeast = toLonLat([extent[2], extent[3]], sourceProjection);
    const longitudes = [southwest[0], southeast[0], northwest[0], northeast[0]];
    const latitudes = [southwest[1], southeast[1], northwest[1], northeast[1]];

    return {
      west: Math.min(...longitudes),
      south: Math.min(...latitudes),
      east: Math.max(...longitudes),
      north: Math.max(...latitudes),
    };
  }

  function armTerrain3dSelection() {
    if (terrain3dSelectionActive) {
      setTerrain3dSelectionActive(false);
      return;
    }

    clearDragSelection();
    setSelectingFocusFireObjective(false);
    setTerrain3dSelectionActive(true);
    setOpenMapContextMenu({
      open: false,
      top: 0,
      left: 0,
      coordinates: [0, 0],
    });
    setOpenTargetFireRecommendation({
      open: false,
      top: 0,
      left: 0,
      targetId: "",
    });
    setOpenMultipleFeatureSelector({
      open: false,
      top: 0,
      left: 0,
      features: [],
    });
    toastContext?.addToast(
      "지형 3D로 볼 영역을 드래그해서 선택하세요.",
      "info"
    );
  }

  function getSelectedFeatureType(featureId: string): string {
    let featureType = "";
    if (game.currentScenario.getAircraft(featureId)) featureType = "aircraft";
    else if (game.currentScenario.getArmy(featureId)) featureType = "army";
    else if (game.currentScenario.getFacility(featureId))
      featureType = "facility";
    else if (game.currentScenario.getAirbase(featureId))
      featureType = "airbase";
    else if (game.currentScenario.getShip(featureId)) featureType = "ship";
    return featureType;
  }

  function getRecommendationTargetIdAtPixel(pixel: Pixel): string | null {
    if (!game.currentSideId) {
      return null;
    }

    const featuresAtPixel = getFeaturesAtPixel(pixel).filter((feature) =>
      ["aircraft", "army", "facility", "airbase", "ship"].includes(
        feature.getProperties()?.type
      )
    );
    if (featuresAtPixel.length !== 1) {
      return null;
    }

    const targetId = featuresAtPixel[0].get("id");
    const target =
      game.currentScenario.getAircraft(targetId) ??
      game.currentScenario.getArmy(targetId) ??
      game.currentScenario.getFacility(targetId) ??
      game.currentScenario.getShip(targetId) ??
      game.currentScenario.getAirbase(targetId);
    if (!target) {
      return null;
    }

    return game
      .getFocusFireHostileSideIds(game.currentSideId)
      .has(target.sideId)
      ? target.id
      : null;
  }

  function getFeaturesInExtent(extent: number[]): Feature[] {
    const selectedFeatures: Feature[] = [];
    const includedFeatureTypes = [
      "aircraft",
      "army",
      "facility",
      "airbase",
      "ship",
      "referencePoint",
    ];
    const seenIds = new Set<string>();

    theMap
      .getLayers()
      .getArray()
      .filter(
        (layer) =>
          layer instanceof VectorLayer || layer instanceof BaseVectorLayer
      )
      .forEach((layer) => {
        const source = layer.getSource() as VectorSource<Feature<Geometry>>;
        source?.getFeatures().forEach((feature) => {
          const featureType = feature.get("type");
          const featureId = feature.get("id");
          const geometry = feature.getGeometry();
          if (
            !featureId ||
            !includedFeatureTypes.includes(featureType) ||
            !geometry ||
            !geometry.intersectsExtent(extent) ||
            seenIds.has(featureId)
          ) {
            return;
          }

          seenIds.add(featureId);
          selectedFeatures.push(feature as Feature);
        });
      });

    return selectedFeatures;
  }

  function clearDragSelection() {
    setDragSelectedFeatures([]);
    setSelectedDragRecommendationTargetId(null);
  }

  function inspectDragSelectedFeature(feature: Feature<Geometry>) {
    clearDragSelection();
    handleSelectSingleFeature(feature);
  }

  function getMapClickContext(event: MapBrowserEvent<MouseEvent>): string {
    let context = "default";
    const featuresAtPixel = getFeaturesAtPixel(
      theMap.getEventPixel(event.originalEvent)
    );
    const selectedFeatureType = getSelectedFeatureType(game.selectedUnitId);
    const attackerFeatureType = getSelectedFeatureType(
      game.currentAttackParams.currentAttackerId
    );
    if (selectedFeatureType === "aircraft" && routeMeasurementDrawLineRef.current) {
      context = "moveAircraft";
    } else if (selectedFeatureType === "army" && routeMeasurementDrawLineRef.current) {
      context = "moveArmy";
    } else if (selectedFeatureType === "ship" && routeMeasurementDrawLineRef.current) {
      context = "moveShip";
    } else if (teleportingFacilityGroupIdRef.current) {
      context = "teleportFacilityGroup";
    } else if (game.selectedUnitId && teleportingUnitRef.current) {
      context = "teleportUnit";
    } else if (selectingFocusFireObjective) {
      context = "focusFireObjective";
    } else if (pendingFacilityPlacement) {
      context = "setFacilityDirection";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "aircraft" &&
      featuresAtPixel.length === 1
    ) {
      context = "aircraftSelectedAttackTarget";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "army" &&
      featuresAtPixel.length === 1
    ) {
      context = "armySelectedAttackTarget";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "ship" &&
      featuresAtPixel.length === 1
    ) {
      context = "shipSelectedAttackTarget";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "aircraft" &&
      featuresAtPixel.length !== 1
    ) {
      context = "aircraftCancelledAttack";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "army" &&
      featuresAtPixel.length !== 1
    ) {
      context = "armyCancelledAttack";
    } else if (
      game.selectingTarget &&
      attackerFeatureType === "ship" &&
      featuresAtPixel.length !== 1
    ) {
      context = "shipCancelledAttack";
    } else if (featuresAtPixel.length === 1) {
      context = "selectSingleFeature";
    } else if (featuresAtPixel.length > 1) {
      context = "selectMultipleFeatures";
    } else if (
      game.addingAircraft ||
      game.addingFacility ||
      game.addingAirbase ||
      game.addingShip ||
      game.addingReferencePoint
    ) {
      context = "addUnit";
    }
    return context;
  }

  function handleMapClick(event: MapBrowserEvent<MouseEvent>) {
    const mapClickContext = getMapClickContext(event);
    const featuresAtPixel = getFeaturesAtPixel(
      theMap.getEventPixel(event.originalEvent)
    );
    switch (mapClickContext) {
      case "moveAircraft": {
        moveAircraft(game.selectedUnitId, event.coordinate);
        break;
      }
      case "moveArmy": {
        moveArmy(game.selectedUnitId, event.coordinate);
        break;
      }
      case "moveShip": {
        moveShip(game.selectedUnitId, event.coordinate);
        break;
      }
      case "teleportUnit": {
        teleportingUnitRef.current = false;
        teleportUnit(game.selectedUnitId, event.coordinate);
        game.selectedUnitId = "";
        setCurrentGameStatusToContext(
          game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
        );
        break;
      }
      case "teleportFacilityGroup": {
        const teleportingGroupId = teleportingFacilityGroupIdRef.current;
        clearPendingFacilityGroupTeleport();
        if (teleportingGroupId) {
          teleportFacilityPlacementGroup(teleportingGroupId, event.coordinate);
        }
        setCurrentGameStatusToContext(
          game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
        );
        break;
      }
      case "focusFireObjective": {
        setFocusFireObjective(event.coordinate);
        break;
      }
      case "setFacilityDirection": {
        finalizeFacilityPlacement(event.coordinate);
        break;
      }
      case "aircraftSelectedAttackTarget": {
        const targetFeature = featuresAtPixel[0];
        const targetId = targetFeature.getProperties()?.id;
        game.handleAircraftAttack(
          game.currentAttackParams.currentAttackerId,
          targetId,
          game.currentAttackParams.currentWeaponId,
          game.currentAttackParams.currentWeaponQuantity,
          game.currentAttackParams.autoAttack
        );
        resetAttack();
        setCurrentGameStatusToContext("표적을 지정했습니다.");
        break;
      }
      case "shipSelectedAttackTarget": {
        const targetFeature = featuresAtPixel[0];
        const targetId = targetFeature.getProperties()?.id;
        game.handleShipAttack(
          game.currentAttackParams.currentAttackerId,
          targetId,
          game.currentAttackParams.currentWeaponId,
          game.currentAttackParams.currentWeaponQuantity,
          game.currentAttackParams.autoAttack
        );
        resetAttack();
        setCurrentGameStatusToContext("표적을 지정했습니다.");
        break;
      }
      case "armySelectedAttackTarget": {
        const targetFeature = featuresAtPixel[0];
        const targetId = targetFeature.getProperties()?.id;
        game.handleArmyAttack(
          game.currentAttackParams.currentAttackerId,
          targetId,
          game.currentAttackParams.currentWeaponId,
          game.currentAttackParams.currentWeaponQuantity,
          game.currentAttackParams.autoAttack
        );
        resetAttack();
        setCurrentGameStatusToContext("표적을 지정했습니다.");
        break;
      }
      case "aircraftCancelledAttack": {
        resetAttack();
        break;
      }
      case "armyCancelledAttack": {
        resetAttack();
        break;
      }
      case "shipCancelledAttack": {
        resetAttack();
        break;
      }
      case "selectSingleFeature":
        handleSelectSingleFeature(featuresAtPixel[0]);
        break;
      case "selectMultipleFeatures":
        handleSelectMultipleFeatures(featuresAtPixel);
        break;
      case "addUnit":
        handleAddUnit(event.coordinate);
        break;
      case "default":
        break;
    }
  }

  function handleSelectSingleFeature(feature: Feature) {
    const currentSelectedFeatureId = feature.getProperties()?.id;
    const currentSelectedFeatureType = feature.getProperties()?.type;
    const currentSelectedFeatureSideId = feature.getProperties()?.sideId;

    if (
      !game.godMode &&
      currentSelectedFeatureSideId &&
      currentSelectedFeatureSideId !== game.currentSideId
    )
      return;

    if (currentSelectedFeatureId) {
      if (
        currentSelectedFeatureType === "aircraft" &&
        game.currentScenario.getAircraft(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeAircraft(currentSelectedFeatureId);
          return;
        }
        game.selectedUnitId = "";
        const aircraft = game.currentScenario.getAircraft(
          currentSelectedFeatureId
        );
        if (aircraft) {
          aircraft.selected = false;
          aircraftLayer.updateAircraftFeature(
            aircraft.id,
            aircraft.selected,
            aircraft.heading
          );
        }
        const aircraftGeometry = feature.getGeometry() as Point;
        const aircraftCoordinate = aircraftGeometry.getCoordinates();
        const aircraftPixels =
          theMap.getPixelFromCoordinate(aircraftCoordinate);
        setOpenAircraftCard({
          open: true,
          top: aircraftPixels[1],
          left: aircraftPixels[0],
          aircraftId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "airbase" &&
        game.currentScenario.getAirbase(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeAirbase(currentSelectedFeatureId);
          return;
        }
        const airbaseGeometry = feature.getGeometry() as Point;
        const airbaseCoordinate = airbaseGeometry.getCoordinates();
        const airbasePixels = theMap.getPixelFromCoordinate(airbaseCoordinate);
        setOpenAirbaseCard({
          open: true,
          top: airbasePixels[1],
          left: airbasePixels[0],
          airbaseId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "army" &&
        game.currentScenario.getArmy(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeArmy(currentSelectedFeatureId);
          return;
        }
        game.selectedUnitId = "";
        const army = game.currentScenario.getArmy(currentSelectedFeatureId);
        if (army) {
          army.selected = false;
          armyLayer.updateArmyFeature(army.id, army.selected, army.heading);
        }
        const armyGeometry = feature.getGeometry() as Point;
        const armyCoordinate = armyGeometry.getCoordinates();
        const armyPixels = theMap.getPixelFromCoordinate(armyCoordinate);
        setOpenArmyCard({
          open: true,
          top: armyPixels[1],
          left: armyPixels[0],
          armyId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "facility" &&
        game.currentScenario.getFacility(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeFacility(currentSelectedFeatureId);
          return;
        }
        const facilityGeometry = feature.getGeometry() as Point;
        const facilityCoordinate = facilityGeometry.getCoordinates();
        const facilityPixels =
          theMap.getPixelFromCoordinate(facilityCoordinate);
        setOpenFacilityCard({
          open: true,
          top: facilityPixels[1],
          left: facilityPixels[0],
          facilityId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "ship" &&
        game.currentScenario.getShip(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeShip(currentSelectedFeatureId);
          return;
        }
        game.selectedUnitId = "";
        const ship = game.currentScenario.getShip(currentSelectedFeatureId);
        if (ship) {
          ship.selected = false;
          shipLayer.updateShipFeature(ship.id, ship.selected, ship.heading);
        }
        const shipGeometry = feature.getGeometry() as Point;
        const shipCoordinate = shipGeometry.getCoordinates();
        const shipPixels = theMap.getPixelFromCoordinate(shipCoordinate);
        setOpenShipCard({
          open: true,
          top: shipPixels[1],
          left: shipPixels[0],
          shipId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "referencePoint" &&
        game.currentScenario.getReferencePoint(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeReferencePoint(currentSelectedFeatureId);
          return;
        }
        const referencePointGeometry = feature.getGeometry() as Point;
        const referencePointCoordinate =
          referencePointGeometry.getCoordinates();
        const referencePointPixels = theMap.getPixelFromCoordinate(
          referencePointCoordinate
        );
        setOpenReferencePointCard({
          open: true,
          top: referencePointPixels[1],
          left: referencePointPixels[0],
          referencePointId: currentSelectedFeatureId,
        });
      } else if (
        currentSelectedFeatureType === "weapon" &&
        game.currentScenario.getWeapon(currentSelectedFeatureId)
      ) {
        if (game.eraserMode) {
          removeWeapon(currentSelectedFeatureId);
          return;
        }
        const weaponGeometry = feature.getGeometry() as Point;
        const weaponCoordinate = weaponGeometry.getCoordinates();
        const weaponPixels = theMap.getPixelFromCoordinate(weaponCoordinate);
        setOpenWeaponCard({
          open: true,
          top: weaponPixels[1],
          left: weaponPixels[0],
          weaponId: currentSelectedFeatureId,
        });
      }
      setKeyboardShortcutsEnabled(false);
    }
  }

  function handleSelectMultipleFeatures(features: Feature[]) {
    if (features.length < 2) return;
    const singleFeatureGeometry = features[0].getGeometry() as Point;
    const singleFeatureCoordinates = singleFeatureGeometry.getCoordinates();
    const singleFeaturePixels = theMap.getPixelFromCoordinate(
      singleFeatureCoordinates
    );
    setOpenMultipleFeatureSelector({
      open: true,
      top: singleFeaturePixels[1],
      left: singleFeaturePixels[0],
      features: features,
    });
  }

  function handleAddUnit(coordinates: number[]) {
    const unitClassSelected = game.selectedUnitClassName;
    if (game.addingAircraft) {
      const aircraftTemplate = unitDbContext
        .getAircraftDb()
        .find((aircraft) => aircraft.className === unitClassSelected);
      addAircraft(
        coordinates,
        aircraftTemplate?.className,
        aircraftTemplate?.speed,
        aircraftTemplate?.maxFuel,
        aircraftTemplate?.fuelRate,
        aircraftTemplate?.range
      );
      game.addingAircraft = false;
    } else if (game.addingFacility) {
      if (!pendingFacilityPlacement) {
        pendingFacilityPlacementRef.current = [...coordinates];
        setPendingFacilityPlacement([...coordinates]);
        updatePendingFacilityPlacementPreview(coordinates);
        setCurrentGameStatusToContext(
          facilityPlacementDefaultsRef.current
            ? `위치를 고정했습니다. ${
                facilityPlacementDefaultsRef.current.formation
                  ? `${facilityPlacementDefaultsRef.current.formation.unitCount}개 포대 분산 템플릿과 권장 부채꼴이 먼저 적용됐습니다.`
                  : "권장 부채꼴이 먼저 적용됐습니다."
              } 마우스를 움직여 수정한 뒤 한 번 더 클릭해 확정하세요.`
            : "위치를 고정했습니다. 마우스를 움직여 부채꼴 방향을 맞추고 한 번 더 클릭해 확정하세요."
        );
        return;
      }
      return;
    } else if (game.addingAirbase) {
      const airbaseTemplate = unitDbContext
        .getAirbaseDb()
        .find((airbase) => airbase.name === unitClassSelected);
      addAirbase(coordinates, airbaseTemplate?.name);
      game.addingAirbase = false;
    } else if (game.addingShip) {
      const shipTemplate = unitDbContext
        .getShipDb()
        .find((ship) => ship.className === unitClassSelected);
      addShip(
        coordinates,
        shipTemplate?.className,
        shipTemplate?.speed,
        shipTemplate?.maxFuel,
        shipTemplate?.fuelRate,
        shipTemplate?.range
      );
      game.addingShip = false;
    } else if (game.addingReferencePoint) {
      addReferencePoint(coordinates);
      game.addingReferencePoint = false;
    }
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
    updateSelectedUnitClassName(null);
  }

  function finalizeFacilityPlacement(directionCoordinates: number[]) {
    if (!pendingFacilityPlacementRef.current) {
      return;
    }

    const deploymentDefaults = facilityPlacementDefaultsRef.current;
    const previews = getPendingFacilityPlacementPreviews(directionCoordinates);
    if (!previews || previews.length === 0) {
      clearPendingFacilityPlacement();
      return;
    }

    const createdFacilities = previews
      .map((preview) =>
        addFacility(
          fromLonLat(
            [preview.longitude, preview.latitude],
            theMap.getView().getProjection()
          ),
          preview.className,
          preview.range,
          preview.heading
        )
      )
      .filter((facility): facility is Facility => Boolean(facility));
    const createdFacilityGroup = registerFacilityPlacementGroup(
      createdFacilities,
      deploymentDefaults?.formation?.templateLabel
    );

    clearPendingFacilityPlacement();
    facilityPlacementDefaultsRef.current = null;
    game.addingFacility = false;
    changeCursorType("");
    if (createdFacilityGroup) {
      selectFacilityPlacementGroup(createdFacilityGroup);
      toastContext?.addToast(
        `${createdFacilityGroup.label} 묶음 ${createdFacilityGroup.facilityIds.length}개를 배치했습니다.`
      );
    }
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
    updateSelectedUnitClassName(null);
  }

  function toggleFocusFireMode() {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    if (!game.focusFireOperation.enabled) {
      if (!game.currentSideId || game.currentScenario.sides.length === 0) {
        toastContext?.addToast(
          "집중포격 모드를 사용하려면 먼저 세력을 선택하세요.",
          "error"
        );
        return;
      }
      game.setFocusFireMode(true);
      setFocusFireDockOpen(true);
      setCurrentGameStatusToContext(
        "집중포격 모드가 켜졌습니다. 화력을 모은 뒤 목표 지점을 지정하세요."
      );
      return;
    }

    setSelectingFocusFireObjective(false);
    game.setFocusFireMode(false);
    refreshAllLayers();
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
  }

  function armFocusFireObjectiveSelection() {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    if (!game.currentSideId || game.currentScenario.sides.length === 0) {
      toastContext?.addToast(
        "집중포격 목표를 지정하려면 먼저 세력을 선택하세요.",
        "error"
      );
      return;
    }

    if (!game.focusFireOperation.enabled) {
      game.setFocusFireMode(true);
    }

    setFocusFireDockOpen(true);
    setSelectingFocusFireObjective(true);
    changeCursorType("crosshair");
    setCurrentGameStatusToContext("집중포격 목표 지점을 클릭하세요.");
  }

  function setFocusFireObjective(coordinates: number[]) {
    const [longitude, latitude] = toLonLat(
      coordinates,
      theMap.getView().getProjection()
    );
    const objective = game.setFocusFireObjective(latitude, longitude);
    setSelectingFocusFireObjective(false);
    changeCursorType("");
    if (objective) {
      setFocusFireDockOpen(true);
      refreshAllLayers();
      setCurrentGameStatusToContext(
        "집중포격 목표를 지정했습니다. 항공/화력 자산이 즉시 집중됩니다."
      );
    }
  }

  function clearFocusFireObjective() {
    setSelectingFocusFireObjective(false);
    changeCursorType("");
    game.clearFocusFireOperation(true, true);
    refreshAllLayers();
    setCurrentGameStatusToContext(
      game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
    );
  }

  function openFocusFireAirwatch() {
    const summary = game.getFocusFireSummary();
    if (
      summary.objectiveLongitude === null ||
      summary.objectiveLatitude === null
    ) {
      toastContext?.addToast(
        "공중 관측을 열려면 먼저 집중포격 목표를 지정하세요.",
        "error"
      );
      return;
    }

    const continueSimulation = !game.scenarioPaused;

    openFlightSimPage(
      [summary.objectiveLongitude, summary.objectiveLatitude],
      "jet",
      {
        objectiveName: summary.objectiveName ?? undefined,
        objectiveLon: summary.objectiveLongitude,
        objectiveLat: summary.objectiveLatitude,
        active: summary.active,
        captureProgress: summary.captureProgress,
        aircraftCount: summary.aircraftCount,
        artilleryCount: summary.artilleryCount,
        armorCount: summary.armorCount,
        weaponsInFlight: summary.weaponsInFlight,
        statusLabel: summary.statusLabel,
        launchPlatforms: summary.launchPlatforms,
        weaponTracks: summary.weaponTracks,
        continueSimulation,
      }
    );
  }

  function handleStartScenario(mode: ScenarioLaunchMode) {
    if (!shouldRunScenarioImmediatelyAfterLaunchModeSelection(mode)) {
      game.scenarioPaused = true;
      setCurrentGameStatusToContext(
        "3D 영역을 선택한 뒤 3D 창에서 실행을 눌러 시뮬레이션을 시작하세요."
      );
      setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
      armTerrain3dSelection();
      return;
    }

    void handlePlayGameClick();
  }

  function getFeaturesAtPixel(pixel: Pixel): Feature[] {
    const selectedFeatures: Feature[] = [];
    const excludedFeatureTypes = [
      "rangeRing",
      "route",
      "aircraftFeatureLabel",
      "armyFeatureLabel",
      "facilityFeatureLabel",
      "airbaseFeatureLabel",
      "shipFeatureLabel",
    ];
    const includedFeatureTypes = [
      "aircraft",
      "army",
      "facility",
      "airbase",
      "ship",
      "weapon",
      "referencePoint",
    ];
    theMap.forEachFeatureAtPixel(
      pixel,
      function (feature) {
        if (includedFeatureTypes.includes(feature.getProperties()?.type))
          selectedFeatures.push(feature as Feature);
      },
      { hitTolerance: 5 }
    );
    return selectedFeatures;
  }

  function loadFeatureEntitiesState() {
    if (!theMap) return;

    const vectorLayers = theMap
      .getLayers()
      .getArray()
      .filter(
        (layer) =>
          layer instanceof VectorLayer || layer instanceof BaseVectorLayer
      );

    const visibleFeaturesMap: Record<string, FeatureEntityState> = {};

    const features = vectorLayers
      .map((layer) => layer.getSource().getFeatures())
      .flat();

    const entityTypes = [
      "aircraft",
      "airbase",
      "army",
      "facility",
      "ship",
      "referencePoint",
    ];
    for (const feature of features) {
      if (
        ["rangeRing", "route"].includes(feature.get("type")) ||
        visibleFeaturesMap[feature.get("id")] !== undefined
      ) {
        continue;
      }
      if (entityTypes.includes(feature.get("type"))) {
        visibleFeaturesMap[feature.get("id")] = {
          id: feature.get("id"),
          name: feature.get("name"),
          type: feature.get("type"),
          sideId: feature.get("sideId"),
          sideColor: feature.get("sideColor"),
        };
      }
    }

    setFeatureEntitiesState(Object.values(visibleFeaturesMap));
    loadFacilityPlacementGroupsFromScenario();
  }

  function handleFeatureEntityStateAction(
    payload: Partial<FeatureEntityState>,
    action: "add" | "remove"
  ) {
    if (action === "remove") {
      setFeatureEntitiesState((prevFeatures) =>
        prevFeatures.filter((feature) => feature.id !== payload.id)
      );
    }

    if (action === "add") {
      const existingFeature = featureEntitiesState.find(
        (feature) => feature.id === payload.id
      );
      if (!existingFeature) {
        setFeatureEntitiesState((prevFeatures) => [
          payload as FeatureEntityState,
          ...prevFeatures,
        ]);
      }
    }
  }

  function updateSelectedUnitClassName(unitClassName: string | null) {
    game.selectedUnitClassName = unitClassName;
  }

  function setAddingAircraft(unitClassName: string) {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    facilityPlacementDefaultsRef.current = null;
    changeCursorType("");
    game.addingAircraft = !game.addingAircraft;
    game.addingFacility = false;
    game.addingAirbase = false;
    game.addingShip = false;
    game.addingReferencePoint = false;
    if (game.addingAircraft) {
      setCurrentGameStatusToContext("지도를 클릭해 항공기를 배치하세요.");
      updateSelectedUnitClassName(unitClassName);
    } else {
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
      updateSelectedUnitClassName(null);
    }
  }

  function setAddingFacility(
    unitClassName: string,
    deploymentDefaults?: AssetPlacementDeploymentDefaults
  ) {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    facilityPlacementDefaultsRef.current = deploymentDefaults ?? null;
    game.addingFacility = !game.addingFacility;
    game.addingAircraft = false;
    game.addingAirbase = false;
    game.addingShip = false;
    game.addingReferencePoint = false;
    if (game.addingFacility) {
      changeCursorType("crosshair");
      setCurrentGameStatusToContext(
        deploymentDefaults?.formation
          ? `지도를 클릭해 ${deploymentDefaults.formation.unitCount}개 포대 분산 템플릿의 중심 위치를 놓으세요.`
          : "지도를 클릭해 지상 무기체계 위치를 놓으세요."
      );
      updateSelectedUnitClassName(unitClassName);
    } else {
      facilityPlacementDefaultsRef.current = null;
      changeCursorType("");
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
      updateSelectedUnitClassName(null);
    }
  }

  function setAddingAirbase(unitClassName: string) {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    facilityPlacementDefaultsRef.current = null;
    changeCursorType("");
    game.addingAirbase = !game.addingAirbase;
    game.addingAircraft = false;
    game.addingFacility = false;
    game.addingShip = false;
    game.addingReferencePoint = false;
    if (game.addingAirbase) {
      setCurrentGameStatusToContext("지도를 클릭해 기지를 배치하세요.");
      updateSelectedUnitClassName(unitClassName);
    } else {
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
      updateSelectedUnitClassName(null);
    }
  }

  function setAddingShip(unitClassName: string) {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    facilityPlacementDefaultsRef.current = null;
    changeCursorType("");
    game.addingShip = !game.addingShip;
    game.addingAircraft = false;
    game.addingFacility = false;
    game.addingAirbase = false;
    game.addingReferencePoint = false;
    if (game.addingShip) {
      setCurrentGameStatusToContext("지도를 클릭해 함정을 배치하세요.");
      updateSelectedUnitClassName(unitClassName);
    } else {
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
      updateSelectedUnitClassName(null);
    }
  }

  function setAddingReferencePoint() {
    clearPendingFacilityPlacement();
    clearPendingFacilityGroupTeleport();
    facilityPlacementDefaultsRef.current = null;
    changeCursorType("");
    game.addingReferencePoint = !game.addingReferencePoint;
    game.addingAircraft = false;
    game.addingFacility = false;
    game.addingAirbase = false;
    game.addingShip = false;
    if (game.addingReferencePoint) {
      setCurrentGameStatusToContext("지도를 클릭해 참조점을 추가하세요.");
    } else {
      setCurrentGameStatusToContext(
        game.scenarioPaused ? "시뮬레이션 일시정지" : "시뮬레이션 진행 중"
      );
    }
  }

  function handleUndo() {
    setGamePaused();
    if (game.undo()) {
      setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
      refreshAllLayers();
      loadFeatureEntitiesState();
    }
  }

  function toggleRecordEverySeconds() {
    game.playbackRecorder.switchRecordingInterval();
    setCurrentRecordingIntervalSeconds(
      game.playbackRecorder.recordEverySeconds
    );
  }

  function handleRecordScenarioClick() {
    game.recordingScenario = true;
    game.startRecording();
  }

  function handleStopRecordingScenarioClick() {
    game.recordingScenario = false;
    // game.exportRecourseRecording();
    game.exportRecording();
  }

  function handleLoadRecording() {
    clearRlCheckpointSpectatorSession();
    setGamePaused();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jsonl";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (
          !loadRecordingContent(content, {
            replayMetrics: null,
            successMessage: "기록 파일을 불러왔습니다.",
            gameStatus: "기록 재생 대기 중",
          })
        ) {
          toastContext?.addToast("기록 파일을 불러오지 못했습니다.", "error");
          return;
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleLoadFixedTargetStrikeReplay() {
    clearRlCheckpointSpectatorSession();
    setGamePaused();
    loadRecordingContent(fixedTargetStrikeRlDemo.recording, {
      replayMetrics: fixedTargetStrikeRlDemo.metrics,
      successMessage: "강화학습 타격 리플레이를 불러왔습니다.",
      gameStatus: "강화학습 리플레이 대기 중",
    });
  }

  async function presentSimulationOutcome() {
    const requestId = simulationOutcomeRequestIdRef.current + 1;
    simulationOutcomeRequestIdRef.current = requestId;

    const summary = buildSimulationOutcomeSummary(game);
    setSimulationOutcomeSummary(summary);
    setSimulationOutcomeNarrative(summary.fallbackSummary);
    setSimulationOutcomeNarrativeSource("fallback");
    setSimulationOutcomeLoading(true);
    setIsGameOver(true);
    setCurrentGameStatusToContext(
      `${summary.endReason} · ${summary.activeSideSummary}`
    );

    const narrative = await requestSimulationOutcomeNarrative(summary);
    if (simulationOutcomeRequestIdRef.current !== requestId) {
      return;
    }

    setSimulationOutcomeNarrative(narrative.text);
    setSimulationOutcomeNarrativeSource(narrative.source);
    setSimulationOutcomeLoading(false);
  }

  function handleStepGameClick() {
    game.recordStep(true);
    setGamePaused();
    const [observation, reward, terminated, truncated, info] =
      stepGameAndDrawFrame();
    // logging as test
    console.log("Located in handleStepGameClick()");
    console.log("Game Step Info:", { observation });
    console.log("Current time: ", game.currentScenario.currentTime);
    if ((terminated as boolean) || (truncated as boolean)) {
      void presentSimulationOutcome();
    }
  }

  function handlePauseGameClick() {
    setGamePaused();
    setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
  }

  function loadAndDisplayCurrentRecordedFrame(
    refreshAll = false,
    announceLiveCommentary = false
  ) {
    game.loadScenario(game.recordingPlayer.getCurrentStep());
    setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
    updateCurrentSimulationLogsToContext({
      announceLiveCommentary,
    });
    const recordingStep = game.recordingPlayer.getCurrentStepIndex();
    setCurrentRecordingStepToContext(recordingStep);
    setActiveReplayMetric(getReplayMetricForStep(recordingStep));
    if (refreshAll) refreshAllLayers();
    else drawNextFrame(game.currentScenario);
  }

  async function handlePlayRecordingClick() {
    game.recordingPlayer.playing = true;
    while (
      !game.recordingPlayer.isAtEnd() &&
      !game.recordingPlayer.isPaused()
    ) {
      game.recordingPlayer.nextStep();
      loadAndDisplayCurrentRecordedFrame();
      await delay(50);
    }
  }

  function handlePauseRecordingClick() {
    game.recordingPlayer.playing = false;
    setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
    setCurrentRecordingStepToContext(
      game.recordingPlayer.getCurrentStepIndex()
    );
  }

  function handleStepRecordingToStep(step: number) {
    if (game.recordingPlayer.isAtStep(step)) return;
    game.recordingPlayer.setCurrentStepIndex(step);
    loadAndDisplayCurrentRecordedFrame(true);
  }

  function handleStepRecordingBackwards() {
    if (game.recordingPlayer.isAtStart()) return;
    game.recordingPlayer.previousStep();
    loadAndDisplayCurrentRecordedFrame(true);
  }

  function handleStepRecordingForwards() {
    if (game.recordingPlayer.isAtEnd()) return;
    game.recordingPlayer.nextStep();
    loadAndDisplayCurrentRecordedFrame(true);
  }

  useEffect(() => {
    if (!game.scenarioPaused) {
      void handlePlayGameClick();
    }
  }, []);

  async function handlePlayGameClick() {
    game.recordStep(true);
    setCurrentGameStatusToContext("시뮬레이션 진행 중");
    game.scenarioPaused = false;
    const initialEndState = game.getGameEndState();
    let gameEnded = initialEndState.terminated || initialEndState.truncated;
    if (gameEnded) {
      void presentSimulationOutcome();
      return;
    }
    while (scenarioMapActiveRef.current && !game.scenarioPaused && !gameEnded) {
      const [_observation, _reward, terminated, truncated, _info] =
        stepGameAndDrawFrame();

      const status = terminated || truncated;
      if ((terminated as boolean) || (truncated as boolean)) {
        console.log("Game ended, located in handlePlayGameClick()");
        console.log("Info:", { terminated, truncated });
        void presentSimulationOutcome();
      }
      gameEnded = status as boolean;

      await delay(
        GAME_SPEED_DELAY_MS[game.currentScenario.timeCompression] ??
          GAME_SPEED_DELAY_MS[1]
      );
    }
  }


  return {
    armFocusFireObjectiveSelection, armTerrain3dSelection, changeCursorType,
    clearDragSelection, clearFocusFireObjective, finalizeFacilityPlacement,
    getFeaturesAtPixel, getFeaturesInExtent, getMapClickContext,
    getRecommendationTargetIdAtPixel, getSelectedFeatureType, handleAddUnit,
    handleFeatureEntityStateAction, handleLoadFixedTargetStrikeReplay, handleLoadRecording,
    handleMapClick, handlePauseGameClick, handlePauseRecordingClick,
    handlePlayGameClick, handlePlayRecordingClick, handleRecordScenarioClick,
    handleSelectMultipleFeatures, handleSelectSingleFeature, handleStartScenario,
    handleStepGameClick, handleStepRecordingBackwards, handleStepRecordingForwards,
    handleStepRecordingToStep, handleStopRecordingScenarioClick, handleUndo,
    inspectDragSelectedFeature, loadAndDisplayCurrentRecordedFrame, loadFeatureEntitiesState,
    openFocusFireAirwatch, presentSimulationOutcome, resolveTerrain3dBounds,
    setAddingAirbase, setAddingAircraft, setAddingFacility,
    setAddingReferencePoint, setAddingShip, setFocusFireObjective,
    toggleFocusFireMode, toggleRecordEverySeconds, updateSelectedUnitClassName,
  };
}
