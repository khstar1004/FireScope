// @ts-nocheck

export default function ScenarioMapView(ctx) {
  const {
    Airbase, AirbaseCard, Aircraft,
    AircraftCard, Army, ArmyCard,
    BottomInfoDisplay, DragSelectionCard, DrawerHeader,
    ExperienceGuideRail, Facility, FacilityCard,
    FocusFireDockPanel, LayerVisibilityPanelToggle, LiveCommentaryNotifications,
    Main, MapContextMenu, MissionCreatorCard,
    MissionEditorCard, MultipleFeatureSelector, ReferencePointCard,
    Ship, ShipCard, SideEditor,
    SimulationLogs, SimulationOutcomeDialog, TargetFireRecommendationCard,
    Toolbar, WeaponCard, activeGuideRailAssetType,
    activeReplayMetric, addAirbase, addAircraftToAirbase,
    addAircraftToShip, addReferencePoint, armFocusFireObjectiveSelection,
    armTerrain3dSelection, assetPlacementFocusIntent, assetPlacementOpenSignal,
    baseMapLayers, baseMapModeId, clearDragSelection,
    clearFocusFireObjective, closeFacilityCard, closeMissionCreator,
    closeMissionEditor, closeSimulationLogs, createAirbaseExperienceSummary,
    createAircraftExperienceSummary, createFacilityExperienceSummary, createImmersiveExperienceDemoAsset,
    createShipExperienceSummary, createWeaponExperienceSummary, currentScenarioTimeCompression,
    currentSideId, dismissLiveCommentaryNotification, dragSelectedFacilityPlacementGroup,
    dragSelectedFeatures, dragSelectedTargetPriorities, drawerOpen,
    exitReplayMode, featureEntitiesState, featureLabelVisible,
    finishRouteDrawLine, focusFireDockOpen, game,
    guideRailSelectionLabels, guideRailVisible, handleAddSide,
    handleAddUnit, handleAddWeaponToAircraft, handleAddWeaponToArmy,
    handleAddWeaponToFacility, handleAddWeaponToShip, handleAircraftAttack,
    handleAircraftAutoAttack, handleAircraftRtb, handleArmyAttack,
    handleArmyAutoAttack, handleCloseSideEditor, handleCreatePatrolMission,
    handleCreateStrikeMission, handleDeleteFeatureEntity, handleDeleteMission,
    handleDeleteSide, handleDeleteWeaponFromAircraft, handleDeleteWeaponFromArmy,
    handleDeleteWeaponFromFacility, handleDeleteWeaponFromShip, handleDrawerClose,
    handleDrawerOpen, handleDuplicateAircraft, handleGuideRailActiveAssetTypeChange,
    handleGuideRailAlertAction, handleGuideRailAssetMixAction, handleGuideRailSelectionsChange,
    handleLoadFixedTargetStrikeReplay, handleLoadRecording, handleOpenSideEditor,
    handlePauseGameClick, handlePauseRecordingClick, handlePlayGameClick,
    handlePlayRecordingClick, handleRecordScenarioClick, handleSelectSingleFeature,
    handleShipAttack, handleShipAutoAttack, handleStartAssetPlacement,
    handleStartScenario, handleStepGameClick, handleStepRecordingBackwards,
    handleStepRecordingForwards, handleStepRecordingToStep, handleStopRecordingScenarioClick,
    handleUndo, handleUpdateAircraftWeaponQuantity, handleUpdateArmyWeaponQuantity,
    handleUpdateFacilityWeaponQuantity, handleUpdatePatrolMission, handleUpdateShipWeaponQuantity,
    handleUpdateSide, handleUpdateStrikeMission, inspectDragSelectedFeature,
    isGameOver, keyboardShortcutsEnabled, launchAircraftFromAirbase,
    launchAircraftFromShip, liveCommentaryNotifications, loadFeatureEntitiesState,
    mapRef, missionCreatorActive, missionCreatorInitialMissionType,
    missionCreatorInitialTargetIds, missionEditorActive, mobileView,
    openAirCombatOverlay, openAirbaseCard, openAircraftCard,
    openArmyCard, openAssetExperiencePage, openFacilityCard,
    openFlightSimPage, openFocusFireAirwatch, openImmersiveExperiencePage,
    openMapContextMenu, openMissionCreator, openMissionEditor,
    openMultipleFeatureSelector, openReferencePointCard, openRlLabPage,
    openShipCard, openSideEditor, openSimulationLogs,
    openTargetFireRecommendation, openWeaponCard, queueAircraftForMovement,
    queueArmyForMovement, queueFacilityPlacementGroupForTeleport, queueShipForMovement,
    queueUnitForTeleport, referencePointVisible, refreshAllLayers,
    removeAirbase, removeAircraft, removeAircraftFromAirbase,
    removeAircraftFromShip, removeArmy, removeFacility,
    removeFacilityPlacementGroup, removeReferencePoint, removeShip,
    removeWeapon, rightOverlayOffset, routeVisible,
    selectFacilityPlacementGroup, selectedAirbase, selectedAircraft,
    selectedAircraftMission, selectedArmy, selectedCombatant,
    selectedDragRecommendationTargetId, selectedFacility, selectedFacilityPlacementGroup,
    selectedReferencePoint, selectedShip, selectedWeapon,
    setAddingAircraft, setAddingFacility, setAddingReferencePoint,
    setAddingShip, setCurrentScenarioSidesToContext, setCurrentScenarioTimeCompression,
    setCurrentScenarioTimeToContext, setFocusFireDockOpen, setIsGameOver,
    setKeyboardShortcutsEnabled, setOpenAirbaseCard, setOpenAircraftCard,
    setOpenArmyCard, setOpenMapContextMenu, setOpenMultipleFeatureSelector,
    setOpenReferencePointCard, setOpenShipCard, setOpenTargetFireRecommendation,
    setOpenWeaponCard, setSelectedDragRecommendationTargetId, setTerrain3dSelectionActive,
    simulationLogsActive, simulationOutcomeLoading, simulationOutcomeNarrative,
    simulationOutcomeNarrativeSource, simulationOutcomeSummary, switchCurrentSide,
    terrain3dSelectionActive, threatRangeVisible, toastContext,
    toggleBaseMapLayer, toggleFeatureLabelVisibility, toggleFocusFireMode,
    toggleRecordEverySeconds, toggleReferencePointVisibility, toggleRouteVisibility,
    toggleScenarioTimeCompression, toggleThreatRangeVisibility, toggleWeaponTrajectoryVisibility,
    updateAirbase, updateAircraft, updateArmy,
    updateCurrentSimulationLogsToContext, updateFacility, updateMapView,
    updateReferencePoint, updateShip, weaponTrajectoryVisible,
  } = ctx;

  return (
    <>
      <Toolbar
        drawerOpen={drawerOpen}
        openDrawer={handleDrawerOpen}
        closeDrawer={handleDrawerClose}
        addAircraftOnClick={setAddingAircraft}
        addFacilityOnClick={setAddingFacility}
        addAirbaseOnClick={addAirbase}
        addShipOnClick={setAddingShip}
        addReferencePointOnClick={setAddingReferencePoint}
        playOnClick={handlePlayGameClick}
        startScenarioOnClick={handleStartScenario}
        stepOnClick={handleStepGameClick}
        pauseOnClick={handlePauseGameClick}
        toggleScenarioTimeCompressionOnClick={toggleScenarioTimeCompression}
        toggleRecordEverySeconds={toggleRecordEverySeconds}
        recordScenarioOnClick={handleRecordScenarioClick}
        stopRecordingScenarioOnClick={handleStopRecordingScenarioClick}
        loadRecordingOnClick={handleLoadRecording}
        loadFixedTargetStrikeReplayOnClick={handleLoadFixedTargetStrikeReplay}
        exitReplayModeOnClick={exitReplayMode}
        handlePlayRecordingClick={handlePlayRecordingClick}
        handlePauseRecordingClick={handlePauseRecordingClick}
        handleStepRecordingToStep={handleStepRecordingToStep}
        handleStepRecordingBackwards={handleStepRecordingBackwards}
        handleStepRecordingForwards={handleStepRecordingForwards}
        handleUndo={handleUndo}
        switchCurrentSideOnClick={switchCurrentSide}
        refreshAllLayers={refreshAllLayers}
        updateMapView={updateMapView}
        loadFeatureEntitiesState={loadFeatureEntitiesState}
        updateScenarioTimeCompression={setCurrentScenarioTimeCompression}
        updateCurrentScenarioTimeToContext={() => {
          setCurrentScenarioTimeToContext(game.currentScenario.currentTime);
        }}
        scenarioTimeCompression={currentScenarioTimeCompression}
        scenarioCurrentSideId={currentSideId}
        game={game}
        featureLabelVisibility={featureLabelVisible}
        toggleFeatureLabelVisibility={toggleFeatureLabelVisibility}
        threatRangeVisibility={threatRangeVisible}
        toggleThreatRangeVisibility={toggleThreatRangeVisibility}
        routeVisibility={routeVisible}
        toggleRouteVisibility={toggleRouteVisibility}
        toggleBaseMapLayer={toggleBaseMapLayer}
        keyboardShortcutsEnabled={keyboardShortcutsEnabled}
        finishRouteDrawLine={finishRouteDrawLine}
        toggleMissionCreator={() => {
          if (missionCreatorActive) {
            closeMissionCreator();
            return;
          }
          openMissionCreator();
        }}
        openSimulationLogs={openSimulationLogs}
        updateCurrentSimulationLogsToContext={
          updateCurrentSimulationLogsToContext
        }
        updateCurrentScenarioSidesToContext={() => {
          setCurrentScenarioSidesToContext([...game.currentScenario.sides]);
        }}
        assetPlacementOpenSignal={assetPlacementOpenSignal}
        assetPlacementFocusIntent={assetPlacementFocusIntent}
        onGuideRailSelectionsChange={handleGuideRailSelectionsChange}
        onGuideRailActiveAssetTypeChange={handleGuideRailActiveAssetTypeChange}
        featureEntitiesPlotted={featureEntitiesState}
        deleteFeatureEntity={handleDeleteFeatureEntity}
        openMissionEditor={openMissionEditor}
        handleOpenSideEditor={handleOpenSideEditor}
        mobileView={mobileView}
        openFlightSimPage={(craft?: string) => {
          openFlightSimPage(game.mapView.currentCameraCenter, craft);
        }}
        openImmersiveExperiencePage={(profile: ImmersiveExperienceProfile) => {
          openImmersiveExperiencePage(
            createImmersiveExperienceDemoAsset(
              profile,
              game.mapView.currentCameraCenter
            )
          );
        }}
        openRlLabPage={() => {
          openRlLabPage(game.exportCurrentScenario());
        }}
        toggleFocusFireMode={toggleFocusFireMode}
        armFocusFireObjectiveSelection={armFocusFireObjectiveSelection}
        clearFocusFireObjective={clearFocusFireObjective}
        openScenario3dView={armTerrain3dSelection}
        openFocusFireAirwatch={openFocusFireAirwatch}
        openFocusFireDock={() => setFocusFireDockOpen(true)}
      />

      {guideRailVisible && !terrain3dSelectionActive && (
        <ExperienceGuideRail
          mobileView={mobileView}
          game={game}
          drawerOpen={drawerOpen}
          startAssetPlacement={handleStartAssetPlacement}
          onAlertAction={handleGuideRailAlertAction}
          onAssetMixAction={handleGuideRailAssetMixAction}
          activeAssetMixId={activeGuideRailAssetType}
          assetSelectionLabels={guideRailSelectionLabels}
          playOnClick={handlePlayGameClick}
          pauseOnClick={handlePauseGameClick}
          stepOnClick={handleStepGameClick}
          openScenario3dView={armTerrain3dSelection}
          openSimulationLogs={openSimulationLogs}
        />
      )}

      {terrain3dSelectionActive && (
        <div
          style={{
            position: "absolute",
            top: mobileView ? "1rem" : "1.25rem",
            left: mobileView ? "1rem" : "1.25rem",
            zIndex: 1002,
            maxWidth: mobileView ? "calc(100vw - 2rem)" : 360,
            padding: "14px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(127, 231, 255, 0.18)",
            background: "rgba(4, 16, 22, 0.88)",
            boxShadow: "0 18px 40px rgba(0, 0, 0, 0.32)",
            backdropFilter: "blur(16px)",
            color: "#ecfffb",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: "rgba(236, 255, 251, 0.72)",
            }}
          >
            TERRAIN 3D
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "17px",
              fontWeight: 800,
            }}
          >
            드래그해서 3D 지형 영역 선택
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "12.5px",
              lineHeight: 1.5,
              color: "rgba(236, 255, 251, 0.76)",
            }}
          >
            마우스로 사각형을 그리면 선택한 구역만 전용 3D 화면으로 엽니다.
            Esc로도 취소할 수 있습니다.
          </div>
          <button
            type="button"
            onClick={() => setTerrain3dSelectionActive(false)}
            style={{
              marginTop: "12px",
              border: "1px solid rgba(127, 231, 255, 0.28)",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.04)",
              color: "#ecfffb",
              padding: "7px 12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            취소
          </button>
        </div>
      )}

      <LayerVisibilityPanelToggle
        baseMapModes={baseMapLayers.getAvailableModes()}
        activeBaseMapModeId={baseMapModeId}
        featureLabelVisibility={featureLabelVisible}
        toggleFeatureLabelVisibility={toggleFeatureLabelVisibility}
        threatRangeVisibility={threatRangeVisible}
        toggleThreatRangeVisibility={toggleThreatRangeVisibility}
        routeVisibility={routeVisible}
        toggleRouteVisibility={toggleRouteVisibility}
        weaponTrajectoryVisibility={weaponTrajectoryVisible}
        toggleWeaponTrajectoryVisibility={toggleWeaponTrajectoryVisibility}
        toggleBaseMapLayer={toggleBaseMapLayer}
        toggleReferencePointVisibility={toggleReferencePointVisibility}
        referencePointVisibility={referencePointVisible}
        rightOffset={rightOverlayOffset}
      />

      <BottomInfoDisplay
        mobileView={mobileView}
        replayMetric={activeReplayMetric}
        selectedCombatant={selectedCombatant}
        rightOffset={mobileView ? undefined : `${rightOverlayOffset}px`}
        focusFireDock={
          <FocusFireDockPanel
            game={game}
            mobileView={mobileView}
            open={focusFireDockOpen}
            onOpen={() => setFocusFireDockOpen(true)}
            onClose={() => setFocusFireDockOpen(false)}
            onToggleFocusFireMode={toggleFocusFireMode}
            onArmObjectiveSelection={armFocusFireObjectiveSelection}
            onClearObjective={clearFocusFireObjective}
            onOpenAirwatch={openFocusFireAirwatch}
          />
        }
      />

      {dragSelectedFeatures.length > 0 && (
        <DragSelectionCard
          game={game}
          sideId={game.currentSideId}
          mobileView={mobileView}
          rightOffset={mobileView ? undefined : `${rightOverlayOffset}px`}
          features={dragSelectedFeatures}
          priorities={dragSelectedTargetPriorities}
          selectedTargetId={selectedDragRecommendationTargetId}
          onSelectTarget={setSelectedDragRecommendationTargetId}
          onCreateStrikeMission={() => {
            openMissionCreator(
              "Strike",
              dragSelectedTargetPriorities.map((entry) => entry.targetId)
            );
            clearDragSelection();
          }}
          onInspectFeature={inspectDragSelectedFeature}
          onClearSelection={clearDragSelection}
          facilityGroupSummary={
            dragSelectedFacilityPlacementGroup
              ? {
                  label: dragSelectedFacilityPlacementGroup.label,
                  memberCount:
                    dragSelectedFacilityPlacementGroup.facilityIds.length,
                }
              : null
          }
          onMoveFacilityGroup={
            dragSelectedFacilityPlacementGroup
              ? () =>
                  queueFacilityPlacementGroupForTeleport(
                    dragSelectedFacilityPlacementGroup.id
                  )
              : undefined
          }
          onDeleteFacilityGroup={
            dragSelectedFacilityPlacementGroup
              ? () =>
                  removeFacilityPlacementGroup(
                    dragSelectedFacilityPlacementGroup.id
                  )
              : undefined
          }
        />
      )}

      {missionCreatorActive && (
        <MissionCreatorCard
          game={game}
          sideId={game.currentSideId}
          initialMissionType={missionCreatorInitialMissionType}
          initialSelectedTargetIds={missionCreatorInitialTargetIds}
          aircraft={game.currentScenario.aircraft.filter(
            (aircraft) =>
              aircraft.sideId === game.currentSideId &&
              game.currentScenario.missions
                .map((mission) => mission.assignedUnitIds)
                .flat()
                .indexOf(aircraft.id) === -1
          )}
          targets={game.currentScenario.getAllTargetsFromEnemySides(
            game.currentSideId
          )}
          referencePoints={game.currentScenario.referencePoints.filter(
            (referencePoint) => referencePoint.sideId === game.currentSideId
          )}
          handleCloseOnMap={closeMissionCreator}
          createPatrolMission={handleCreatePatrolMission}
          createStrikeMission={handleCreateStrikeMission}
        />
      )}

      {missionEditorActive.open &&
        game.currentScenario.missions.filter(
          (mission) =>
            mission.sideId ===
            game.currentScenario.getSide(game.currentSideId)?.id
        ).length > 0 && (
          <MissionEditorCard
            game={game}
            sideId={game.currentSideId}
            missions={game.currentScenario.missions.filter(
              (mission) =>
                mission.sideId ===
                game.currentScenario.getSide(game.currentSideId)?.id
            )}
            selectedMissionId={missionEditorActive.selectedMissionId}
            aircraft={game.currentScenario.aircraft.filter(
              (aircraft) => aircraft.sideId === game.currentSideId
            )}
            referencePoints={game.currentScenario.referencePoints.filter(
              (referencePoint) => referencePoint.sideId === game.currentSideId
            )}
            targets={game.currentScenario.getAllTargetsFromEnemySides(
              game.currentSideId
            )}
            updatePatrolMission={handleUpdatePatrolMission}
            updateStrikeMission={handleUpdateStrikeMission}
            deleteMission={handleDeleteMission}
            handleCloseOnMap={closeMissionEditor}
          />
        )}

      {simulationLogsActive && (
        <SimulationLogs handleCloseOnMap={closeSimulationLogs} />
      )}

      <LiveCommentaryNotifications
        notifications={liveCommentaryNotifications}
        onDismiss={dismissLiveCommentaryNotification}
        rightOffset={rightOverlayOffset}
      />

      <Main open={drawerOpen}>
        <DrawerHeader />
        <div
          ref={mapRef}
          id="map"
          className={baseMapModeId === "evening" ? "scenario-map--evening" : ""}
        ></div>
      </Main>

      {selectedAirbase && (
        <AirbaseCard
          airbase={selectedAirbase}
          sideName={game.currentScenario.getSideName(selectedAirbase.sideId)}
          handleAddAircraft={addAircraftToAirbase}
          handleDeleteAircraft={removeAircraftFromAirbase}
          handleLaunchAircraft={launchAircraftFromAirbase}
          handleDeleteAirbase={removeAirbase}
          handleEditAirbase={updateAirbase}
          handleTeleportUnit={queueUnitForTeleport}
          openAssetExperience={() => {
            openAssetExperiencePage(
              createAirbaseExperienceSummary(
                selectedAirbase,
                game.currentScenario.getSideName(selectedAirbase.sideId)
              )
            );
          }}
          anchorPositionTop={openAirbaseCard.top}
          anchorPositionLeft={openAirbaseCard.left}
          handleCloseOnMap={() => {
            setOpenAirbaseCard({
              open: false,
              top: 0,
              left: 0,
              airbaseId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {selectedFacility && (
        <FacilityCard
          facility={selectedFacility}
          sideName={game.currentScenario.getSideName(selectedFacility.sideId)}
          handleTeleportUnit={queueUnitForTeleport}
          handleDeleteFacility={removeFacility}
          facilityGroupSummary={
            selectedFacilityPlacementGroup
              ? {
                  label: selectedFacilityPlacementGroup.label,
                  memberCount:
                    selectedFacilityPlacementGroup.facilityIds.length,
                }
              : null
          }
          handleSelectFacilityGroup={
            selectedFacilityPlacementGroup
              ? () =>
                  selectFacilityPlacementGroup(
                    selectedFacilityPlacementGroup.id
                  )
              : undefined
          }
          handleTeleportFacilityGroup={
            selectedFacilityPlacementGroup
              ? () =>
                  queueFacilityPlacementGroupForTeleport(
                    selectedFacilityPlacementGroup.id
                  )
              : undefined
          }
          handleDeleteFacilityGroup={
            selectedFacilityPlacementGroup
              ? () =>
                  removeFacilityPlacementGroup(
                    selectedFacilityPlacementGroup.id
                  )
              : undefined
          }
          handleEditFacility={updateFacility}
          handleAddWeapon={handleAddWeaponToFacility}
          handleDeleteWeapon={handleDeleteWeaponFromFacility}
          handleUpdateWeaponQuantity={handleUpdateFacilityWeaponQuantity}
          openAssetExperience={() => {
            openAssetExperiencePage(
              createFacilityExperienceSummary(
                selectedFacility,
                game.currentScenario.getSideName(selectedFacility.sideId)
              )
            );
          }}
          anchorPositionTop={openFacilityCard.top}
          anchorPositionLeft={openFacilityCard.left}
          handleCloseOnMap={closeFacilityCard}
        />
      )}
      {selectedArmy && (
        <ArmyCard
          army={selectedArmy}
          sideName={game.currentScenario.getSideName(selectedArmy.sideId)}
          handleDeleteArmy={removeArmy}
          handleMoveArmy={queueArmyForMovement}
          handleArmyAttack={handleArmyAttack}
          handleArmyAutoAttack={handleArmyAutoAttack}
          handleTeleportUnit={queueUnitForTeleport}
          handleEditArmy={updateArmy}
          handleAddWeapon={handleAddWeaponToArmy}
          handleDeleteWeapon={handleDeleteWeaponFromArmy}
          handleUpdateWeaponQuantity={handleUpdateArmyWeaponQuantity}
          anchorPositionTop={openArmyCard.top}
          anchorPositionLeft={openArmyCard.left}
          handleCloseOnMap={() => {
            setOpenArmyCard({
              open: false,
              top: 0,
              left: 0,
              armyId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {selectedAircraft && (
        <AircraftCard
          aircraft={selectedAircraft}
          sideName={game.currentScenario.getSideName(selectedAircraft.sideId)}
          currentMissionName={selectedAircraftMission?.name ?? null}
          currentMissionId={selectedAircraftMission?.id ?? ""}
          openMissionEditor={openMissionEditor}
          handleDeleteAircraft={removeAircraft}
          handleMoveAircraft={queueAircraftForMovement}
          handleAircraftAttack={handleAircraftAttack}
          handleAircraftAutoAttack={handleAircraftAutoAttack}
          handleEditAircraft={updateAircraft}
          handleAircraftRtb={handleAircraftRtb}
          handleDuplicateAircraft={handleDuplicateAircraft}
          handleTeleportUnit={queueUnitForTeleport}
          handleAddWeapon={handleAddWeaponToAircraft}
          handleDeleteWeapon={handleDeleteWeaponFromAircraft}
          handleUpdateWeaponQuantity={handleUpdateAircraftWeaponQuantity}
          openTacticalExperience={() => {
            openAirCombatOverlay(
              createAircraftExperienceSummary(
                selectedAircraft,
                game.currentScenario.getSideName(selectedAircraft.sideId),
                selectedAircraftMission?.name
              ),
              {
                continueSimulation: !game.scenarioPaused,
              }
            );
          }}
          anchorPositionTop={openAircraftCard.top}
          anchorPositionLeft={openAircraftCard.left}
          handleCloseOnMap={() => {
            setOpenAircraftCard({
              open: false,
              top: 0,
              left: 0,
              aircraftId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {selectedShip && (
        <ShipCard
          ship={selectedShip}
          sideName={game.currentScenario.getSideName(selectedShip.sideId)}
          handleAddAircraft={addAircraftToShip}
          handleDeleteAircraft={removeAircraftFromShip}
          handleLaunchAircraft={launchAircraftFromShip}
          handleDeleteShip={removeShip}
          handleMoveShip={queueShipForMovement}
          handleShipAttack={handleShipAttack}
          handleShipAutoAttack={handleShipAutoAttack}
          handleTeleportUnit={queueUnitForTeleport}
          handleEditShip={updateShip}
          handleAddWeapon={handleAddWeaponToShip}
          handleDeleteWeapon={handleDeleteWeaponFromShip}
          handleUpdateWeaponQuantity={handleUpdateShipWeaponQuantity}
          openAssetExperience={() => {
            openAssetExperiencePage(
              createShipExperienceSummary(
                selectedShip,
                game.currentScenario.getSideName(selectedShip.sideId)
              )
            );
          }}
          anchorPositionTop={openShipCard.top}
          anchorPositionLeft={openShipCard.left}
          handleCloseOnMap={() => {
            setOpenShipCard({
              open: false,
              top: 0,
              left: 0,
              shipId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {selectedReferencePoint && (
        <ReferencePointCard
          referencePoint={selectedReferencePoint}
          sideName={game.currentScenario.getSideName(
            selectedReferencePoint.sideId
          )}
          handleDeleteReferencePoint={removeReferencePoint}
          handleEditReferencePoint={updateReferencePoint}
          handleTeleportUnit={queueUnitForTeleport}
          anchorPositionTop={openReferencePointCard.top}
          anchorPositionLeft={openReferencePointCard.left}
          handleCloseOnMap={() => {
            setOpenReferencePointCard({
              open: false,
              top: 0,
              left: 0,
              referencePointId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {selectedWeapon && (
        <WeaponCard
          weapon={selectedWeapon}
          sideName={game.currentScenario.getSideName(selectedWeapon.sideId)}
          handleTeleportUnit={queueUnitForTeleport}
          handleDeleteWeapon={removeWeapon}
          openAssetExperience={() => {
            openAssetExperiencePage(
              createWeaponExperienceSummary(
                selectedWeapon,
                game.currentScenario.getSideName(selectedWeapon.sideId)
              )
            );
          }}
          anchorPositionTop={openWeaponCard.top}
          anchorPositionLeft={openWeaponCard.left}
          handleCloseOnMap={() => {
            setOpenWeaponCard({
              open: false,
              top: 0,
              left: 0,
              weaponId: "",
            });
            setKeyboardShortcutsEnabled(true);
          }}
        />
      )}
      {openMultipleFeatureSelector.open && (
        <MultipleFeatureSelector
          features={openMultipleFeatureSelector.features}
          handleSelectSingleFeature={handleSelectSingleFeature}
          anchorPositionTop={openMultipleFeatureSelector.top}
          anchorPositionLeft={openMultipleFeatureSelector.left}
          handleCloseOnMap={() => {
            setOpenMultipleFeatureSelector({
              open: false,
              top: 0,
              left: 0,
              features: [],
            });
          }}
        />
      )}
      {openSideEditor.open && openSideEditor.anchorEl && (
        <SideEditor
          open={openSideEditor.open}
          anchorEl={openSideEditor.anchorEl}
          side={game.currentScenario.getSide(openSideEditor.sideId)}
          sides={game.currentScenario.sides}
          hostiles={
            openSideEditor.sideId
              ? game.currentScenario.relationships.getHostiles(
                  openSideEditor.sideId
                )
              : []
          }
          allies={
            openSideEditor.sideId
              ? game.currentScenario.relationships.getAllies(
                  openSideEditor.sideId
                )
              : []
          }
          doctrine={
            openSideEditor.sideId
              ? game.currentScenario.getSideDoctrine(openSideEditor.sideId)
              : game.currentScenario.getDefaultSideDoctrine()
          }
          updateSide={handleUpdateSide}
          addSide={handleAddSide}
          deleteSide={handleDeleteSide}
          handleCloseOnMap={handleCloseSideEditor}
        />
      )}
      {openMapContextMenu.open && (
        <MapContextMenu
          anchorPositionTop={openMapContextMenu.top}
          anchorPositionLeft={openMapContextMenu.left}
          handleCloseOnMap={() => {
            setOpenMapContextMenu({
              ...openMapContextMenu,
              open: false,
            });
          }}
          handleAddReferencePoint={() => {
            if (
              !game.currentSideId ||
              game.currentScenario.sides.length === 0
            ) {
              toastContext?.addToast(
                "참조점을 추가하려면 먼저 세력을 선택하세요.",
                "error"
              );
              return;
            }
            addReferencePoint(openMapContextMenu.coordinates);
          }}
          handleAddAirbase={() => {
            if (
              !game.currentSideId ||
              game.currentScenario.sides.length === 0
            ) {
              toastContext?.addToast(
                "기지를 추가하려면 먼저 세력을 선택하세요.",
                "error"
              );
              return;
            }
            addAirbase(openMapContextMenu.coordinates);
          }}
          handleAddAircraft={(unitClassName: string) => {
            if (
              !game.currentSideId ||
              game.currentScenario.sides.length === 0
            ) {
              toastContext?.addToast(
                "항공기를 추가하려면 먼저 세력을 선택하세요.",
                "error"
              );
              return;
            }
            game.addingAircraft = true;
            game.selectedUnitClassName = unitClassName;
            handleAddUnit(openMapContextMenu.coordinates);
          }}
          handleAddShip={(unitClassName: string) => {
            if (
              !game.currentSideId ||
              game.currentScenario.sides.length === 0
            ) {
              toastContext?.addToast(
                "함정을 추가하려면 먼저 세력을 선택하세요.",
                "error"
              );
              return;
            }
            game.addingShip = true;
            game.selectedUnitClassName = unitClassName;
            handleAddUnit(openMapContextMenu.coordinates);
          }}
          handleAddFacility={(unitClassName: string) => {
            if (
              !game.currentSideId ||
              game.currentScenario.sides.length === 0
            ) {
              toastContext?.addToast(
                "지상 무기체계를 추가하려면 먼저 세력을 선택하세요.",
                "error"
              );
              return;
            }
            game.addingFacility = true;
            game.selectedUnitClassName = unitClassName;
            handleAddUnit(openMapContextMenu.coordinates);
          }}
        />
      )}
      {openTargetFireRecommendation.open &&
        (() => {
          const target = game.getTargetById(
            openTargetFireRecommendation.targetId
          );
          const recommendation = openTargetFireRecommendation.targetId
            ? game.getFireRecommendationForTarget(
                openTargetFireRecommendation.targetId,
                game.currentSideId
              )
            : null;

          if (
            !target ||
            !(
              target instanceof Aircraft ||
              target instanceof Army ||
              target instanceof Facility ||
              target instanceof Ship ||
              target instanceof Airbase
            )
          ) {
            return null;
          }

          return (
            <TargetFireRecommendationCard
              top={openTargetFireRecommendation.top}
              left={openTargetFireRecommendation.left}
              targetName={target.name}
              targetLatitude={target.latitude}
              targetLongitude={target.longitude}
              recommendation={recommendation}
              rerankerModel={game.getFocusFireRerankerState().model}
              handleCloseOnMap={() => {
                setOpenTargetFireRecommendation({
                  open: false,
                  top: 0,
                  left: 0,
                  targetId: "",
                });
              }}
            />
          );
        })()}
      <SimulationOutcomeDialog
        open={isGameOver}
        summary={simulationOutcomeSummary}
        narrative={simulationOutcomeNarrative}
        narrativeSource={simulationOutcomeNarrativeSource}
        loading={simulationOutcomeLoading}
        onClose={() => setIsGameOver(false)}
      />
    </>
    // The end of the return
  );

  // END
}