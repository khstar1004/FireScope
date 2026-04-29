// @ts-nocheck

export function useToolbarRenderSections(ctx) {
  const {
    Box, Button, COLOR_PALETTE,
    Chip, ClearIcon, Cloud,
    DEFAULT_ICON_COLOR_FILTER, Dba, Delete,
    Divider, EntityIcon, EraserIcon,
    FileReader, GodModeIcon, IconButton,
    ListItemIcon, ListItemText, ListSubheader,
    Menu, MenuItem, Message,
    PRIORITY_ARTILLERY_BASE_OPTIONS, React, RecordingPlayer,
    SELECTED_ICON_COLOR_FILTER, SIDE_COLOR, Stack,
    Storage, Tooltip, Typography,
    UploadFileOutlinedIcon, airbaseClassMenuOpen, airbaseDb,
    airbaseIconAnchorEl, aircraftClassMenuOpen, aircraftDb,
    aircraftIconAnchorEl, assetPlacementPreview, buildAdaptiveArtilleryPresetOptions,
    buildBaseSelectionAirbaseOptions, buildFocusFireInsight, buildPriorityQuickAddAirbaseOptions,
    buildSafeDownloadTimestamp, cloudScenarios, deleteScenarioFromCloud,
    downloadTextFile, droneAircraftDb, droneClassMenuOpen,
    droneIconAnchorEl, entityFilterSelectedOptions, experienceAnchorEl,
    experienceMenuOpen, facilityDb, formatSecondsToString,
    getDisplayName, getEntityTypeLabel, handleAirbaseClose,
    handleAirbaseIconClick, handleAircraftIconClick, handleAircraftIconClose,
    handleDeleteFeatureEntity, handleDroneIconClick, handleDroneIconClose,
    handleEntitySideChange, handleExperienceMenuClose, handleLoadScenarioIconClose,
    handlePlayClick, handleQuickAddMenuClose, handleRecordScenarioClick,
    handleReferencePointIconClick, handleSamIconClick, handleSamIconClose,
    handleShipIconClick, handleShipIconClose, handleStepClick,
    handleTankIconClick, handleTankIconClose, handleUndo,
    handleUnitClassSelect, handleUnitDbToolsIconClick, handleUnitDbToolsIconClose,
    isChatInputFocused, isDroneAircraftClassName, isScenarioEmptyForOnboarding,
    isTankFacilityClassName, loadCloudScenario, loadPresetScenario,
    loadScenarioAnchorEl, presetScenarioSelectionMenuOpen, props,
    quickAddAnchorEl, quickAddMenuOpen, recordingScenario,
    reloadScenario, resolveFocusFireDockStage, samClassMenuOpen,
    samIconAnchorEl, scenarioEditNameAnchorEl, scenarioLaunchDialogOpen,
    selectedAirbaseUnitClass, selectedAircraftUnitClass, selectedArmorUnitClass,
    selectedBaseSelectionKey, selectedDroneUnitClass, selectedSamUnitClass,
    selectedShipUnitClass, selectedSideId, setScenarioPaused,
    setUnitDbContext, setUnitDbToolsIconAnchorEl, shipClassMenuOpen,
    shipDb, shipIconAnchorEl, sortBaseSelectionOptionsByDistance,
    strategicScenarioPresets, tankClassMenuOpen, tankFacilityDb,
    tankIconAnchorEl, toSelectionOptions, toastContext,
    unitDbContext, unitDbToolsIconAnchorEl, unitDbToolsMenuOpen,
  } = ctx;

  const buildQuickAddSections = (): QuickAddSection[] => {
    const koreanAircraftNames = new Set([
      "KF-21 Boramae",
      "FA-50 Fighting Eagle",
      "T-50 Golden Eagle",
      "TA-50 Lead-In Fighter Trainer",
      "F-15K Slam Eagle",
      "KF-16",
    ]);
    const strikeAircraftPattern = /F-35|F-22|F-16|F-15|F\/A-18|F-4|F-14|A-10/i;
    const supportAircraftPattern = /KC-|C-\d+|B-\d+/i;
    const koreanFacilityPattern =
      /Chunmoo|Tactical Surface to Surface|L-SAM|Cheongung|Pegasus|Biho/i;
    const alliedDefensePattern = /Patriot|THAAD|Aster|Barak|NASAMS/i;
    const hostileDefensePattern = /S-400|S-300|S-500|Buk|Tor|Pantsir|HQ-/i;
    const koreanShipPattern =
      /Jeongjo|Sejong|Chungmugong|Daegu|Incheon|Dokdo|Yoon Youngha/i;

    const toAircraftEntry = (
      className: string,
      description: string,
      entityType: ToolbarEntityType = "aircraft"
    ): QuickAddEntry => ({
      key: `aircraft-${className}`,
      label: getDisplayName(className),
      entityType,
      unitType: "aircraft",
      value: className,
      description,
    });
    const toFacilityEntry = (
      className: string,
      description: string
    ): QuickAddEntry => ({
      key: `facility-${className}`,
      label: getDisplayName(className),
      entityType: "facility",
      unitType: "facility",
      value: className,
      description,
    });
    const toShipEntry = (
      className: string,
      description: string
    ): QuickAddEntry => ({
      key: `ship-${className}`,
      label: getDisplayName(className),
      entityType: "ship",
      unitType: "ship",
      value: className,
      description,
    });
    const prioritizedQuickAddAirbaseOptions =
      sortBaseSelectionOptionsByDistance(
        buildPriorityQuickAddAirbaseOptions(airbaseDb),
        props.game.mapView.currentCameraCenter
      );

    const sections: QuickAddSection[] = [
      {
        title: "드론 전력",
        items: droneAircraftDb.map((aircraft) =>
          toAircraftEntry(
            aircraft.className,
            "무인 정찰·감시·정밀타격 자산 배치",
            "drone"
          )
        ),
      },
      {
        title: "항공 전력",
        items: aircraftDb
          .filter((aircraft) => {
            if (isDroneAircraftClassName(aircraft.className)) {
              return false;
            }

            return (
              koreanAircraftNames.has(aircraft.className) ||
              strikeAircraftPattern.test(aircraft.className) ||
              supportAircraftPattern.test(aircraft.className)
            );
          })
          .map((aircraft) => {
            if (koreanAircraftNames.has(aircraft.className)) {
              return toAircraftEntry(aircraft.className, "한국 항공전력 배치");
            }
            if (supportAircraftPattern.test(aircraft.className)) {
              return toAircraftEntry(
                aircraft.className,
                "폭격·수송·지원 자산 배치"
              );
            }
            return toAircraftEntry(aircraft.className, "전투·공격 자산 배치");
          }),
      },
      {
        title: "기갑 전력",
        items: tankFacilityDb.map((facility) => ({
          key: `facility-${facility.className}`,
          label: getDisplayName(facility.className),
          entityType: "tank",
          unitType: "facility",
          value: facility.className,
          description: "전차·장갑차 계열 지상 자산 배치",
        })),
      },
      {
        title: "지상 전력",
        items: facilityDb
          .filter((facility) => {
            if (isTankFacilityClassName(facility.className)) {
              return false;
            }

            return (
              koreanFacilityPattern.test(facility.className) ||
              alliedDefensePattern.test(facility.className) ||
              hostileDefensePattern.test(facility.className)
            );
          })
          .map((facility) => {
            if (
              /Chunmoo|Tactical Surface to Surface/i.test(facility.className)
            ) {
              return toFacilityEntry(
                facility.className,
                "장거리 화력 자산 배치"
              );
            }
            if (koreanFacilityPattern.test(facility.className)) {
              return toFacilityEntry(
                facility.className,
                "한국 방공·지상 전력 배치"
              );
            }
            if (alliedDefensePattern.test(facility.className)) {
              return toFacilityEntry(facility.className, "연합 방공 자산 배치");
            }
            return toFacilityEntry(facility.className, "적 방공망 자산 배치");
          }),
      },
      {
        title: "해상 전력",
        items: shipDb.map((ship) =>
          toShipEntry(
            ship.className,
            koreanShipPattern.test(ship.className)
              ? "한국 함정 전력 배치"
              : "범용 해상 전력 배치"
          )
        ),
      },
      {
        title: "기지 / 유틸",
        items: [
          ...recommendedArtilleryBaseOptions,
          ...prioritizedQuickAddAirbaseOptions,
          {
            key: "reference-point",
            label: "참조점",
            entityType: "referencePoint",
            description: "기준 위치 또는 작전 포인트 추가",
            onClick: handleReferencePointIconClick,
          },
        ],
      },
    ];

    return sections.filter((section) => section.items.length > 0);
  };

  const recommendedArtilleryBaseOptions = buildAdaptiveArtilleryPresetOptions(
    sortBaseSelectionOptionsByDistance(
      PRIORITY_ARTILLERY_BASE_OPTIONS,
      props.game.mapView.currentCameraCenter
    ),
    props.game.currentScenario,
    props.game.currentSideId
  ).map((item) => ({
    ...item,
    presetContext: {
      regionLabel: item.regionLabel,
      coverageLabel: item.coverageLabel,
      representativeAssetLabel: item.representativeAssetLabel,
      sourceLabel: item.sourceLabel,
      threatAxisLabel: item.threatAxisLabel,
    },
    deploymentDefaults:
      item.deploymentHeadingDegrees !== undefined
        ? {
            headingDegrees: item.deploymentHeadingDegrees,
            arcDegrees: item.deploymentArcDegrees,
            recommendationLabel: item.deploymentRecommendationLabel,
            formation: item.formation,
          }
        : undefined,
  }));

  const experienceSections = [
    {
      title: "지상전",
      items: [
        {
          key: "experience-airwatch-3d",
          label: "선택 영역 3D",
          description: "드래그로 고른 구역만 전용 3D 지형 화면으로 표시",
          entityType: "facility" as const,
          onClick: props.openScenario3dView,
        },
        {
          key: "experience-ground",
          label: "지상 기동 브리프",
          description: "지상 기동 작전 흐름을 미리 확인하는 준비 화면",
          entityType: "facility" as const,
          onClick: () => props.openImmersiveExperiencePage("ground"),
        },
        {
          key: "experience-fires",
          label: "화력 운용 브리프",
          description: "화력 임무 흐름과 발사 구성을 정리하는 준비 화면",
          entityType: "facility" as const,
          onClick: () => props.openImmersiveExperiencePage("fires"),
        },
        {
          key: "experience-defense",
          label: "방공 체계 브리프",
          description: "방공 임무 흐름과 요격 구성을 정리하는 준비 화면",
          entityType: "facility" as const,
          onClick: () => props.openImmersiveExperiencePage("defense"),
        },
      ],
    },
    {
      title: "해상전",
      items: [
        {
          key: "experience-maritime",
          label: "함정 운용 브리프",
          description: "해상 전력 모델과 임무 흐름을 정리하는 준비 화면",
          entityType: "ship" as const,
          onClick: () => props.openImmersiveExperiencePage("maritime"),
        },
      ],
    },
    {
      title: "항공전",
      items: [
        {
          key: "experience-drone",
          label: "드론 시뮬레이터",
          description: "저속·저고도 드론 시점 비행 시뮬레이션",
          entityType: "aircraft" as const,
          onClick: () => props.openFlightSimPage("drone"),
        },
        {
          key: "experience-helicopter",
          label: "헬기 대응 브리프",
          description: "헬기 출격과 기지 대응 흐름을 정리하는 준비 화면",
          entityType: "aircraft" as const,
          onClick: () => props.openImmersiveExperiencePage("base"),
        },
        {
          key: "experience-jet",
          label: "전투기 시뮬레이터",
          description: "제트 전투기 고속 비행 시뮬레이션",
          entityType: "aircraft" as const,
          onClick: () => props.openFlightSimPage("jet"),
        },
        {
          key: "experience-base",
          label: "기지 운용 브리프",
          description: "기지 방호와 출격 구성을 정리하는 준비 화면",
          entityType: "airbase" as const,
          onClick: () => props.openImmersiveExperiencePage("base"),
        },
      ],
    },
  ];
  const focusFireSummary = props.game.getFocusFireSummary();
  const focusFireInsight = buildFocusFireInsight(focusFireSummary);
  const focusFireDockStage = resolveFocusFireDockStage(focusFireSummary);
  const isEmptyScenario = isScenarioEmptyForOnboarding(
    props.game.currentScenario
  );
  const scenarioAssetCount =
    props.game.currentScenario.aircraft.length +
    props.game.currentScenario.airbases.length +
    props.game.currentScenario.armies.length +
    props.game.currentScenario.facilities.length +
    props.game.currentScenario.ships.length;
  const currentSideId = props.game.currentScenario.getSide(
    props.game.currentSideId
  )?.id;
  const sideSelectCurrentSideId = currentSideId ?? selectedSideId;
  const currentSideName = props.game.currentScenario.getSideName(
    props.game.currentSideId
  );
  const currentSideMissionCount = props.game.currentScenario.missions.filter(
    (mission) => mission.sideId === currentSideId
  ).length;
  const entityFilterTypeOptions = [
    "airbase",
    "aircraft",
    "army",
    "ship",
    "facility",
    "referencePoint",
  ];
  const scenarioSideIds = props.game.currentScenario.sides.map(
    (side) => side.id
  );
  const currentlySelectedSideIds = props.game.godMode
    ? scenarioSideIds
    : [props.game.currentSideId];
  const plottedSideFeatures = props.featureEntitiesPlotted.filter(
    (feature: FeatureEntityState) =>
      currentlySelectedSideIds.includes(feature.sideId)
  );
  const selectedEntitySideIds = entityFilterSelectedOptions.filter(
    (selectedOption: string) => scenarioSideIds.includes(selectedOption)
  );
  const selectedEntityTypes = entityFilterSelectedOptions.filter(
    (selectedOption: string) => entityFilterTypeOptions.includes(selectedOption)
  );
  const filteredEntityFeatures = props.featureEntitiesPlotted.filter(
    (feature: FeatureEntityState) => {
      if (selectedEntitySideIds.length > 0) {
        if (selectedEntityTypes.length > 0) {
          return (
            selectedEntityTypes.includes(feature.type) &&
            selectedEntitySideIds.includes(feature.sideId)
          );
        }

        return selectedEntitySideIds.includes(feature.sideId);
      }

      return selectedEntityTypes.includes(feature.type);
    }
  );
  const currentSideOperationalFeatureCount =
    props.featureEntitiesPlotted.filter(
      (feature: FeatureEntityState) =>
        feature.sideId === currentSideId &&
        !feature.type.startsWith("reference")
    ).length;
  const scenarioMissionCount = props.game.currentScenario.missions.length;
  const scenarioWeaponsInFlight = props.game.currentScenario.weapons.length;
  const scenarioStatusLabel = props.game.scenarioPaused
    ? "일시정지"
    : "실행 중";
  const focusFireSectionOpen =
    focusFireSummary.enabled ||
    focusFireSummary.active ||
    Boolean(focusFireSummary.objectiveName);
  const missionSectionOpen = props.game.currentScenario.missions.length > 0;
  const focusFireRiskTone =
    focusFireInsight.shockIndex >= 70 || scenarioWeaponsInFlight >= 4
      ? "danger"
      : focusFireInsight.shockIndex >= 40 || scenarioWeaponsInFlight >= 2
        ? "warning"
        : focusFireSummary.enabled || focusFireSummary.objectiveName
          ? "accent"
          : "neutral";
  const commandPanelSummary = (() => {
    if (isEmptyScenario) {
      return {
        riskLabel: "구성 전",
        riskTone: "neutral" as const,
        summary: "자산 배치 필요",
        action: "정찰·화력 자산 우선 배치",
        recommendedMissionValue: "초기 배치",
        recommendedMissionDetail: "첫 임무 생성",
      };
    }

    if (
      focusFireSummary.active &&
      (focusFireInsight.shockIndex >= 70 || scenarioWeaponsInFlight >= 4)
    ) {
      return {
        riskLabel: "긴급",
        riskTone: "danger" as const,
        summary: `${
          focusFireSummary.objectiveName ?? "목표 축"
        } 화력 집중 · 비행탄 ${scenarioWeaponsInFlight}발`,
        action: focusFireSummary.recommendation?.targetName
          ? `${focusFireSummary.recommendation.targetName} 후속 타격 정리`
          : "방호 축 우선 정리",
        recommendedMissionValue: focusFireSummary.recommendation?.missionKind
          ? `${focusFireSummary.recommendation.missionKind}`
          : "화력 대응",
        recommendedMissionDetail: focusFireSummary.recommendation
          ?.recommendedOptionLabel
          ? `${focusFireSummary.recommendation.recommendedOptionLabel} · ${focusFireSummary.recommendation.launchReadinessLabel}`
          : "즉응 자산 우선",
      };
    }

    if (
      currentSideMissionCount === 0 &&
      currentSideOperationalFeatureCount > 0
    ) {
      return {
        riskLabel: "주의",
        riskTone: "warning" as const,
        summary: `자산 ${currentSideOperationalFeatureCount} · 임무 없음`,
        action: "초계/타격 임무 생성",
        recommendedMissionValue: "임무 생성 필요",
        recommendedMissionDetail: "표적 또는 순찰 축 지정",
      };
    }

    if (focusFireSummary.enabled || focusFireSummary.objectiveName) {
      return {
        riskLabel: "공세 준비",
        riskTone: "accent" as const,
        summary: `${
          focusFireSummary.objectiveName ?? "목표 축"
        } ${focusFireSummary.statusLabel}`,
        action: focusFireSummary.recommendation?.targetName
          ? `${focusFireSummary.recommendation.targetName} 패키지 점검`
          : "목표·발사 패키지 점검",
        recommendedMissionValue: focusFireSummary.recommendation?.targetName
          ? `${focusFireSummary.recommendation.targetName} 타격`
          : "화력 임무 준비",
        recommendedMissionDetail:
          focusFireSummary.recommendation?.launchReadinessLabel ??
          "발사 준비 확인",
      };
    }

    if (scenarioWeaponsInFlight > 0 || currentSideMissionCount >= 3) {
      return {
        riskLabel: "경계",
        riskTone: "warning" as const,
        summary: `임무 ${currentSideMissionCount} · 비행탄 ${scenarioWeaponsInFlight}`,
        action: "우선순위 재정렬",
        recommendedMissionValue: "임무 재정렬",
        recommendedMissionDetail: "핵심 축 재집중",
      };
    }

    return {
      riskLabel: "안정",
      riskTone: "accent" as const,
      summary: `자산 ${currentSideOperationalFeatureCount} · 임무 ${currentSideMissionCount}`,
      action: "현재 흐름 유지",
      recommendedMissionValue: "현재 임무 유지",
      recommendedMissionDetail:
        focusFireSummary.recommendation?.recommendedOptionLabel ??
        "필요 시 화력 전환",
    };
  })();
  const sectionHeaderBadges = {
    recording: [
      {
        label: props.game.recordingPlayer.hasRecording()
          ? "재생 준비"
          : "기록 대기",
        tone: props.game.recordingPlayer.hasRecording() ? "accent" : "default",
      },
      {
        label: recordingScenario
          ? "REC"
          : `간격 ${formatSecondsToString(
              props.game.playbackRecorder.recordEverySeconds
            )}`,
        tone: recordingScenario ? "warning" : "default",
      },
    ] as const,
    assets: [
      {
        label: `${filteredEntityFeatures.length}개`,
        tone: filteredEntityFeatures.length > 0 ? "accent" : "default",
      },
      {
        label: props.game.godMode ? "전체 시점" : currentSideName,
        tone: props.game.godMode ? "warning" : "default",
      },
    ] as const,
    focusFire: [
      {
        label: `충격량 ${focusFireInsight.shockIndex}`,
        tone:
          focusFireRiskTone === "danger"
            ? "danger"
            : focusFireRiskTone === "warning"
              ? "warning"
              : "accent",
      },
      {
        label: focusFireSummary.statusLabel,
        tone: focusFireSummary.active
          ? "danger"
          : focusFireSummary.enabled
            ? "accent"
            : "default",
      },
    ] as const,
    mission: [
      {
        label: `${currentSideMissionCount}개`,
        tone: currentSideMissionCount > 0 ? "accent" : "default",
      },
      {
        label: currentSideName,
        tone: "default",
      },
    ] as const,
  };
  const armyGptBriefingCards: ArmyGptBriefingCard[] = [
    {
      label: "전력",
      value: `자산 ${currentSideOperationalFeatureCount} · 임무 ${currentSideMissionCount}`,
      description: props.game.godMode
        ? `전체 시점 기준 표시 자산 ${plottedSideFeatures.length}개를 추적 중입니다.`
        : `${currentSideName} 기준 현재 전장 자산과 임무 흐름을 추적합니다.`,
      tone: currentSideMissionCount > 0 ? "accent" : "neutral",
    },
    {
      label: "위협",
      value: commandPanelSummary.riskLabel,
      description: commandPanelSummary.summary,
      tone: commandPanelSummary.riskTone,
    },
    {
      label: "권고 임무",
      value: commandPanelSummary.recommendedMissionValue,
      description: commandPanelSummary.recommendedMissionDetail,
      tone: commandPanelSummary.riskTone === "danger" ? "warning" : "accent",
    },
  ];

  const focusFireSection = () => (
    <Stack spacing={1} sx={{ p: 0.35 }}>
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(45, 214, 196, 0.08)",
        }}
      >
        <Stack direction="row" spacing={0.8} sx={{ flexWrap: "wrap" }}>
          <Chip
            size="small"
            color={focusFireSummary.active ? "warning" : "default"}
            label={focusFireSummary.statusLabel}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`점령 ${focusFireSummary.captureProgress.toFixed(0)}%`}
          />
        </Stack>

        <Typography variant="body2" sx={{ mt: 0.85, color: "text.secondary" }}>
          목표 {focusFireSummary.objectiveName ?? "미지정"}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.45, color: "text.secondary" }}>
          포대 {focusFireSummary.artilleryCount} · 기갑{" "}
          {focusFireSummary.armorCount} · 항공 {focusFireSummary.aircraftCount}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.45, color: "text.secondary" }}>
          다음 단계 {focusFireDockStage.title}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Button
          size="small"
          variant={focusFireSummary.enabled ? "outlined" : "contained"}
          onClick={props.toggleFocusFireMode}
        >
          {focusFireSummary.enabled ? "모드 해제" : "모드 켜기"}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={props.armFocusFireObjectiveSelection}
        >
          목표 지정
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={props.openFocusFireDock}
        >
          작전 패널
        </Button>
      </Stack>

      <Typography sx={{ fontSize: 12, color: "text.secondary", px: 0.2 }}>
        충격량 {focusFireInsight.shockIndex} · {focusFireInsight.intensityLabel}
      </Typography>
    </Stack>
  );

  const handleGodModeToggle = () => {
    props.game.toggleGodMode();
    if (props.game.godMode) {
      handleEntitySideChange(
        props.game.currentScenario.sides.map((side) => side.id)
      );
    } else {
      handleEntitySideChange([props.game.currentSideId]);
    }
    toastContext?.addToast(
      `전체 시점: ${props.game.godMode ? "켜짐" : "꺼짐"}`
    );
  };

  const handleEraserModeToggle = () => {
    props.game.toggleEraserMode();
    toastContext?.addToast(
      `지우개 모드: ${props.game.eraserMode ? "켜짐" : "꺼짐"}`
    );
  };

  // handles "hotkey" mechanic
  const keyboardEventHandler = (event: KeyboardEvent) => {
    const key = event.key;
    switch (key) {
      case " ":
        event.preventDefault();
        handlePlayClick();
        break;
      case "n":
        event.preventDefault();
        handleStepClick();
        break;
      case "r":
        event.preventDefault();
        reloadScenario();
        break;
      case "f":
        event.preventDefault();
        props.toggleScenarioTimeCompressionOnClick();
        break;
      case "g":
        event.preventDefault();
        handleGodModeToggle();
        break;
      case "e":
        event.preventDefault();
        handleEraserModeToggle();
        break;
      case "z":
        event.preventDefault();
        handleUndo();
        break;
      case "1":
        event.preventDefault();
        if (selectedAircraftUnitClass) {
          props.addAircraftOnClick(selectedAircraftUnitClass);
        }
        break;
      case "2":
        event.preventDefault();
        if (selectedAirbaseUnitClass) {
          const airbaseTemplate = unitDbContext
            .getAirbaseDb()
            .find((airbase) => airbase.name === selectedAirbaseUnitClass);
          props.addAirbaseOnClick([0, 0], airbaseTemplate?.name, [
            airbaseTemplate?.longitude ?? 0,
            airbaseTemplate?.latitude ?? 0,
          ]);
        }
        break;
      case "3":
        event.preventDefault();
        if (selectedSamUnitClass) {
          props.addFacilityOnClick(selectedSamUnitClass);
        }
        break;
      case "4":
        event.preventDefault();
        if (selectedShipUnitClass) {
          props.addShipOnClick(selectedShipUnitClass);
        }
        break;
      case "5":
        event.preventDefault();
        props.addReferencePointOnClick();
        break;
      case "6":
        event.preventDefault();
        props.toggleBaseMapLayer();
        break;
      case "7":
        event.preventDefault();
        props.toggleRouteVisibility(!props.routeVisibility);
        break;
      case "8":
        event.preventDefault();
        props.toggleThreatRangeVisibility(!props.threatRangeVisibility);
        break;
      case "9":
        event.preventDefault();
        props.toggleFeatureLabelVisibility(!props.featureLabelVisibility);
        break;
      case "Escape":
        event.preventDefault();
        props.finishRouteDrawLine();
        break;
      default:
        break;
    }
  };

  if (
    props.keyboardShortcutsEnabled &&
    !scenarioEditNameAnchorEl &&
    !isChatInputFocused &&
    !assetPlacementPreview &&
    !scenarioLaunchDialogOpen
  ) {
    document.onkeydown = keyboardEventHandler;
  } else {
    document.onkeydown = null;
  }

  const ScenarioDb = [
    { name: "default_scenario", displayName: "기본 데모" },
    { name: "rl_first_success_demo", displayName: "RL 첫 체감 데모" },
    {
      name: "rl_battle_optimization_demo",
      displayName: "RL 전투·배치 최적화 데모",
    },
    { name: "focused_training_demo", displayName: "가용화력자산" },
    { name: "combat_demo_1", displayName: "전투데모#1" },
    { name: "focus_fire_economy_demo", displayName: "화력 배치 경제성 비교" },
    { name: "army_demo", displayName: "전장 데모" },
    ...strategicScenarioPresets.map((scenario) => ({
      name: scenario.name,
      displayName: scenario.displayName,
    })),
    { name: "_upload", displayName: "파일 불러오기..." },
  ];

  const presetScenarioSelectionMenu = () => {
    return (
      <Menu
        id="preset-scenario-selection-menu"
        anchorEl={loadScenarioAnchorEl}
        open={presetScenarioSelectionMenuOpen}
        onClose={handleLoadScenarioIconClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          root: { sx: { ".MuiList-root": { padding: 0 } } },
          list: {
            "aria-labelledby": "add-aircraft-icon-button",
          },
        }}
      >
        <Stack
          direction={"row"}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
            pl: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            불러오기
          </Typography>
          <IconButton onClick={handleLoadScenarioIconClose}>
            <ClearIcon sx={{ fontSize: 15, color: "red" }} />
          </IconButton>
        </Stack>
        {ScenarioDb.map((scenario) => (
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) =>
              loadPresetScenario(scenario.name)
            }
            key={scenario.name}
            value={scenario.name}
          >
            {scenario.displayName}
          </MenuItem>
        ))}
        {cloudScenarios.map((scenario: CloudScenario) => (
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) =>
              loadCloudScenario(scenario.scenarioId)
            }
            key={scenario.scenarioId}
            value={scenario.scenarioId}
            sx={{ paddingTop: 0 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <Cloud />
                </ListItemIcon>
                <ListItemText
                  primary={scenario.name}
                  sx={{
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                />
              </Box>

              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteScenarioFromCloud(scenario.scenarioId);
                }}
                sx={{ ml: 2 }}
              >
                <Delete color="error" />
              </IconButton>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    );
  };

  const recordingSection = () => {
    return (
      <Stack spacing={1} direction={"column"}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            px: 1,
            py: 0.8,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(45, 214, 196, 0.12)",
          }}
        >
          <Chip
            variant="outlined"
            label={recordingScenario ? "기록 종료" : "기록 시작"}
            onClick={handleRecordScenarioClick}
          />
          <Chip
            variant="outlined"
            label={`간격 ${formatSecondsToString(props.game.playbackRecorder.recordEverySeconds)}`}
            onClick={props.toggleRecordEverySeconds}
          />
          <Tooltip title="기록 파일 열기">
            <IconButton onClick={props.loadRecordingOnClick}>
              <UploadFileOutlinedIcon
                fontSize="medium"
                sx={{ color: "var(--fs-text)" }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
        <Chip
          variant="filled"
          label="RL 타격 데모"
          onClick={props.loadFixedTargetStrikeReplayOnClick}
          sx={{
            alignSelf: "center",
            backgroundColor: "rgba(45, 214, 196, 0.92)",
            color: "#031114",
            fontWeight: 700,
          }}
        />
        {props.game.recordingPlayer.hasRecording() && (
          <RecordingPlayer
            recordingPaused={props.game.recordingPlayer.isPaused()}
            timelineStart={props.game.recordingPlayer.getStartStepIndex()}
            timelineEnd={props.game.recordingPlayer.getEndStepIndex()}
            handlePlayRecordingClick={props.handlePlayRecordingClick}
            handlePauseRecordingClick={props.handlePauseRecordingClick}
            handleStepRecordingToStep={props.handleStepRecordingToStep}
            handleStepRecordingBackwards={props.handleStepRecordingBackwards}
            handleStepRecordingForwards={props.handleStepRecordingForwards}
            formatTimelineMark={(recordingStep: number) =>
              props.game.recordingPlayer.getStepScenarioTime(recordingStep)
            }
          />
        )}
      </Stack>
    );
  };

  const missionSection = () => {
    const sideMissions = props.game.currentScenario.missions.filter(
      (mission) => mission.sideId === currentSideId
    );
    if (!sideMissions || !Array.isArray(sideMissions) || !sideMissions.length) {
      return (
        <Box
          sx={{
            px: 1.2,
            py: 1,
            borderRadius: 1.5,
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(45, 214, 196, 0.1)",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            표시할 항목이 없습니다.
          </Typography>
        </Box>
      );
    }

    //Return statement (core visuals)
    return (
      <Stack spacing={1} direction="column">
        {sideMissions.map((mission) => (
          <Tooltip
            key={mission.id}
            placement="right"
            arrow
            title={
              <Stack direction={"column"} spacing={0.1}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  임무명: {mission.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  세력: {props.game.currentScenario.getSideName(mission.sideId)}
                </Typography>
              </Stack>
            }
          >
            <MenuItem
              onClick={() => {
                props.openMissionEditor(mission.id);
              }}
              key={mission.id}
              value={mission.name}
              sx={{
                borderRadius: 1.5,
                border: "1px solid rgba(45, 214, 196, 0.1)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <ListItemText primary={mission.name} />
            </MenuItem>
          </Tooltip>
        ))}
      </Stack>
    );
  };

  const quickAddSections = buildQuickAddSections();
  const baseSelectionAirbaseOptions = sortBaseSelectionOptionsByDistance(
    buildBaseSelectionAirbaseOptions(airbaseDb),
    props.game.mapView.currentCameraCenter
  );

  const quickAddMenu = () => (
    <Menu
      id="quick-add-menu"
      anchorEl={quickAddAnchorEl}
      open={quickAddMenuOpen}
      onClose={handleQuickAddMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        root: {
          sx: {
            ".MuiList-root": {
              py: 0,
              minWidth: 360,
              maxHeight: 520,
            },
          },
        },
      }}
    >
      {quickAddSections.map((section, sectionIndex) => (
        <React.Fragment key={section.title}>
          <ListSubheader
            sx={{
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              color: COLOR_PALETTE.BLACK,
              fontWeight: 700,
              lineHeight: 2.2,
            }}
          >
            {section.title}
          </ListSubheader>
          {section.items.map((item) => (
            <MenuItem
              key={item.key}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.unitType && item.value) {
                  handleUnitClassSelect(
                    item.unitType,
                    item.value,
                    toSelectionOptions(item)
                  );
                }
                handleQuickAddMenuClose();
              }}
            >
              <ListItemIcon>
                <EntityIcon type={item.entityType} />
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </MenuItem>
          ))}
          {sectionIndex < quickAddSections.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Menu>
  );

  const experienceMenu = () => (
    <Menu
      id="toolbar-3d-experience-menu"
      anchorEl={experienceAnchorEl}
      open={experienceMenuOpen}
      onClose={handleExperienceMenuClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      slotProps={{
        root: {
          sx: {
            ".MuiList-root": {
              py: 0,
              minWidth: 340,
            },
          },
        },
      }}
    >
      {experienceSections.map((section, sectionIndex) => (
        <React.Fragment key={section.title}>
          <ListSubheader
            sx={{
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              color: COLOR_PALETTE.BLACK,
              fontWeight: 700,
              lineHeight: 2.2,
            }}
          >
            {section.title}
          </ListSubheader>
          {section.items.map((item) => (
            <MenuItem
              key={item.key}
              onClick={() => {
                item.onClick();
                handleExperienceMenuClose();
              }}
            >
              <ListItemIcon>
                <EntityIcon type={item.entityType} />
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </MenuItem>
          ))}
          {sectionIndex < experienceSections.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </Menu>
  );

  const entityMenuButtons = () => {
    const toolbarAssetIconButtonSx = {
      mx: props.mobileView ? 0 : 0.15,
      width: 34,
      height: 34,
      borderRadius: 1.5,
      color: "var(--fs-text)",
      backgroundColor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(45, 214, 196, 0.12)",
      boxShadow: "inset 0 1px 0 rgba(134, 255, 242, 0.04)",
      "&:hover": {
        backgroundColor: "rgba(45, 214, 196, 0.14)",
        borderColor: "rgba(45, 214, 196, 0.24)",
      },
    };

    return (
      <Stack
        direction={"row"}
        spacing={props.mobileView ? 2 : 0}
        sx={
          props.mobileView
            ? { justifyContent: "center", flexWrap: "wrap" }
            : {
                alignItems: "center",
                px: 0.35,
                py: 0.15,
                borderRadius: 999,
                border: "1px solid rgba(45, 214, 196, 0.12)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }
        }
      >
        {/** Add Aircraft Menu/Button */}
        <Tooltip title="항공기 추가">
          <IconButton
            id="add-aircraft-icon-button"
            aria-controls={
              aircraftClassMenuOpen ? "aircraft-classes-menu" : undefined
            }
            aria-haspopup="true"
            aria-expanded={aircraftClassMenuOpen ? "true" : undefined}
            onClick={handleAircraftIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="aircraft" />
          </IconButton>
        </Tooltip>
        <Menu
          id="aircraft-classes-menu"
          anchorEl={aircraftIconAnchorEl}
          open={aircraftClassMenuOpen}
          onClose={handleAircraftIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "add-aircraft-icon-button",
            },
          }}
        >
          <Stack
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              항공기 선택
            </Typography>
            <IconButton onClick={handleAircraftIconClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {unitDbContext.getAircraftDb().map((aircraft) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("aircraft", aircraft.className);
                handleAircraftIconClose();
              }}
              selected={aircraft.className === selectedAircraftUnitClass}
              key={aircraft.className}
              value={aircraft.className}
            >
              {getDisplayName(aircraft.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Drone Menu/Button */}
        <Tooltip title="드론 추가">
          <IconButton
            id="add-drone-icon-button"
            aria-controls={
              droneClassMenuOpen ? "drone-classes-menu" : undefined
            }
            aria-haspopup="true"
            aria-expanded={droneClassMenuOpen ? "true" : undefined}
            onClick={handleDroneIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="drone" />
          </IconButton>
        </Tooltip>
        <Menu
          id="drone-classes-menu"
          anchorEl={droneIconAnchorEl}
          open={droneClassMenuOpen}
          onClose={handleDroneIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "add-drone-icon-button",
            },
          }}
        >
          <Stack
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              드론 선택
            </Typography>
            <IconButton onClick={handleDroneIconClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {droneAircraftDb.map((aircraft) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("aircraft", aircraft.className);
                handleDroneIconClose();
              }}
              selected={aircraft.className === selectedDroneUnitClass}
              key={aircraft.className}
              value={aircraft.className}
            >
              {getDisplayName(aircraft.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Airbase Menu/Button */}
        <Tooltip title="기지/포병 프리셋 추가">
          <IconButton
            id="add-airbase-icon-button"
            aria-controls={
              airbaseClassMenuOpen ? "airbase-classes-menu" : undefined
            }
            aria-haspopup="true"
            aria-expanded={airbaseClassMenuOpen ? "true" : undefined}
            onClick={handleAirbaseIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="airbase" />
          </IconButton>
        </Tooltip>
        <Menu
          id="airbase-classes-menu"
          anchorEl={airbaseIconAnchorEl}
          open={airbaseClassMenuOpen}
          onClose={handleAirbaseClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: {
              sx: {
                ".MuiList-root": {
                  padding: 0,
                  minWidth: 360,
                  maxHeight: 520,
                },
              },
            },
            list: {
              "aria-labelledby": "add-airbase-icon-button",
            },
          }}
        >
          <Stack
            spacing={2}
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              기지/포병 선택
            </Typography>
            <IconButton onClick={handleAirbaseClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          <ListSubheader
            sx={{
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              color: COLOR_PALETTE.BLACK,
              fontWeight: 700,
              lineHeight: 2.2,
            }}
          >
            포병 우선 · 가까운 권역순
          </ListSubheader>
          {recommendedArtilleryBaseOptions.map((item) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect(
                  item.unitType,
                  item.value,
                  toSelectionOptions(item)
                );
                handleAirbaseClose();
              }}
              selected={item.key === selectedBaseSelectionKey}
              key={item.key}
              value={item.value}
            >
              <ListItemIcon>
                <EntityIcon type={item.entityType} />
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </MenuItem>
          ))}
          <Divider />
          <ListSubheader
            sx={{
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              color: COLOR_PALETTE.BLACK,
              fontWeight: 700,
              lineHeight: 2.2,
            }}
          >
            공군기지 · 가까운 권역순
          </ListSubheader>
          {baseSelectionAirbaseOptions.map((item) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect(
                  item.unitType,
                  item.value,
                  toSelectionOptions(item)
                );
                handleAirbaseClose();
              }}
              selected={item.key === selectedBaseSelectionKey}
              key={item.key}
              value={item.value}
            >
              <ListItemIcon>
                <EntityIcon type={item.entityType} />
              </ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </MenuItem>
          ))}
        </Menu>
        {/** Add Sam Menu/Button */}
        <Tooltip title="지상 무기체계 추가">
          <IconButton
            id="add-sam-icon-button"
            aria-controls={samClassMenuOpen ? "sam-classes-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={samClassMenuOpen ? "true" : undefined}
            onClick={handleSamIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="facility" />
          </IconButton>
        </Tooltip>
        <Menu
          id="sam-classes-menu"
          anchorEl={samIconAnchorEl}
          open={samClassMenuOpen}
          onClose={handleSamIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "add-sam-icon-button",
            },
          }}
        >
          <Stack
            spacing={2}
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              지상 무기체계 선택
            </Typography>
            <IconButton onClick={handleSamIconClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {unitDbContext.getFacilityDb().map((facility) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("facility", facility.className);
                handleSamIconClose();
              }}
              selected={facility.className === selectedSamUnitClass}
              key={facility.className}
              value={facility.className}
            >
              {getDisplayName(facility.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Tank Menu/Button */}
        <Tooltip title="전차/장갑차 추가">
          <IconButton
            id="add-tank-icon-button"
            aria-controls={tankClassMenuOpen ? "tank-classes-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={tankClassMenuOpen ? "true" : undefined}
            onClick={handleTankIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="tank" />
          </IconButton>
        </Tooltip>
        <Menu
          id="tank-classes-menu"
          anchorEl={tankIconAnchorEl}
          open={tankClassMenuOpen}
          onClose={handleTankIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "add-tank-icon-button",
            },
          }}
        >
          <Stack
            spacing={2}
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              전차/장갑차 선택
            </Typography>
            <IconButton onClick={handleTankIconClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {tankFacilityDb.map((facility) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("facility", facility.className);
                handleTankIconClose();
              }}
              selected={facility.className === selectedArmorUnitClass}
              key={facility.className}
              value={facility.className}
            >
              {getDisplayName(facility.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Ship Menu/Button */}
        <Tooltip title="함정 추가">
          <IconButton
            id="add-ship-icon-button"
            aria-controls={shipClassMenuOpen ? "ship-classes-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={shipClassMenuOpen ? "true" : undefined}
            onClick={handleShipIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="ship" />
          </IconButton>
        </Tooltip>
        <Menu
          id="ship-classes-menu"
          anchorEl={shipIconAnchorEl}
          open={shipClassMenuOpen}
          onClose={handleShipIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "add-ship-icon-button",
            },
          }}
        >
          <Stack
            spacing={2}
            direction={"row"}
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
              pl: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              함정 선택
            </Typography>
            <IconButton onClick={handleShipIconClose}>
              <ClearIcon sx={{ fontSize: 15, color: "red" }} />
            </IconButton>
          </Stack>
          {unitDbContext.getShipDb().map((ship) => (
            <MenuItem
              onClick={(_event: React.MouseEvent<HTMLElement>) => {
                handleUnitClassSelect("ship", ship.className);
                handleShipIconClose();
              }}
              selected={ship.className === selectedShipUnitClass}
              key={ship.className}
              value={ship.className}
            >
              {getDisplayName(ship.className)}
            </MenuItem>
          ))}
        </Menu>
        {/** Add Reference Point */}
        <Tooltip title="참조점 추가">
          <IconButton
            onClick={handleReferencePointIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <EntityIcon type="referencePoint" />
          </IconButton>
        </Tooltip>
        {/** Unit Db Functions */}
        <Tooltip title="자료 도구">
          <IconButton
            onClick={handleUnitDbToolsIconClick}
            sx={toolbarAssetIconButtonSx}
          >
            <Storage />
          </IconButton>
        </Tooltip>
        <Menu
          id="unit-db-functions-menu"
          anchorEl={unitDbToolsIconAnchorEl}
          open={unitDbToolsMenuOpen}
          onClose={handleUnitDbToolsIconClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            root: { sx: { ".MuiList-root": { padding: 0 } } },
            list: {
              "aria-labelledby": "unit-db-functions-button",
            },
          }}
        >
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) => {
              const exportedUnitDb = unitDbContext.exportToJson();
              downloadTextFile(
                `vista_units_${buildSafeDownloadTimestamp()}.json`,
                exportedUnitDb,
                "text/json"
              );
              setUnitDbToolsIconAnchorEl(null);
            }}
            key={"export-unit-db"}
          >
            유닛 자료 저장
          </MenuItem>
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) => {
              const diagnostics = unitDbContext.buildDiagnosticsReport();
              downloadTextFile(
                `vista_unit_db_diagnostics_${buildSafeDownloadTimestamp()}.json`,
                JSON.stringify(diagnostics, null, 2),
                "application/json"
              );
              toastContext?.addToast(
                `검증 완료: 오류 ${diagnostics.summary.errorCount}건, 경고 ${diagnostics.summary.warningCount}건입니다.`,
                diagnostics.summary.errorCount > 0 ? "warning" : "success",
                7000
              );
              setUnitDbToolsIconAnchorEl(null);
            }}
            key={"validate-unit-db"}
          >
            유닛 자료 검증 리포트
          </MenuItem>
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) => {
              const parityReport = unitDbContext.buildPythonParityReport();
              downloadTextFile(
                `vista_unit_db_ts_python_parity_${buildSafeDownloadTimestamp()}.json`,
                JSON.stringify(parityReport, null, 2),
                "application/json"
              );
              toastContext?.addToast(
                `비교 완료: 오류 ${parityReport.summary.errorCount}건, 경고 ${parityReport.summary.warningCount}건입니다.`,
                parityReport.summary.errorCount > 0 ? "warning" : "success",
                7000
              );
              setUnitDbToolsIconAnchorEl(null);
            }}
            key={"validate-unit-db-parity"}
          >
            TS/Python 정합성 리포트
          </MenuItem>
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) => {
              const syncPlan = unitDbContext.buildPythonSyncPlan();
              downloadTextFile(
                `vista_unit_db_ts_python_sync_plan_${buildSafeDownloadTimestamp()}.json`,
                JSON.stringify(syncPlan, null, 2),
                "application/json"
              );
              toastContext?.addToast(
                `동기화 후보 ${syncPlan.summary.actionCount}건을 정리했습니다. 우선순위 높음 ${syncPlan.summary.highPriorityCount}건입니다.`,
                syncPlan.summary.highPriorityCount > 0 ? "warning" : "success",
                7000
              );
              setUnitDbToolsIconAnchorEl(null);
            }}
            key={"unit-db-sync-plan"}
          >
            TS/Python 동기화 후보
          </MenuItem>
          <MenuItem
            onClick={(_event: React.MouseEvent<HTMLElement>) => {
              props.pauseOnClick();
              setScenarioPaused(true);
              const input = document.createElement("input");
              input.style.display = "none";
              input.type = "file";
              input.accept = ".json";
              input.onchange = (event) => {
                input.remove();
                const file = (event.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.readAsText(file, "UTF-8");
                  reader.onload = (readerEvent) => {
                    try {
                      const unitDbString = readerEvent.target?.result as string;
                      const importedUnitDb = Dba.fromJson(unitDbString);
                      const diagnostics =
                        importedUnitDb.buildDiagnosticsReport();
                      setUnitDbContext(importedUnitDb);
                      toastContext?.addToast(
                        `유닛 자료를 불러왔습니다. 오류 ${diagnostics.summary.errorCount}건, 경고 ${diagnostics.summary.warningCount}건입니다.`,
                        diagnostics.summary.errorCount > 0
                          ? "warning"
                          : "success",
                        7000
                      );
                      setUnitDbToolsIconAnchorEl(null);
                    } catch (_error) {
                      toastContext?.addToast(
                        "자료 형식이 올바르지 않아 불러오지 못했습니다.",
                        "error"
                      );
                    }
                  };
                  reader.onerror = () => {
                    reader.abort();
                    toastContext?.addToast(
                      "자료 불러오기에 실패했습니다.",
                      "error"
                    );
                  };
                }
              };
              input.click();
            }}
            key={"import-unit-db"}
          >
            유닛 자료 불러오기
          </MenuItem>
        </Menu>
        {/** Enable Eraser */}
        <Tooltip title="지우개">
          <IconButton onClick={handleEraserModeToggle}>
            <img
              src={EraserIcon}
              alt="지우개 아이콘"
              width={24}
              height={24}
              style={{
                filter: props.game.eraserMode
                  ? SELECTED_ICON_COLOR_FILTER
                  : DEFAULT_ICON_COLOR_FILTER,
              }}
            />
          </IconButton>
        </Tooltip>
        {/** Enable God Mode */}
        <Tooltip title="전체 보기">
          <IconButton onClick={handleGodModeToggle}>
            <GodModeIcon
              sx={{
                color: props.game.godMode ? SIDE_COLOR.GREEN : "var(--fs-text)",
                width: 24,
                height: 24,
              }}
            />
          </IconButton>
        </Tooltip>
        {/** Open Simulation Logs*/}
        <Tooltip title="진행 기록">
          <IconButton onClick={props.openSimulationLogs}>
            <Message
              sx={{
                color: "var(--fs-text)",
                width: 24,
                height: 24,
              }}
            />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  };

  const entitiesSection = () => {
    if (
      !entityFilterSelectedOptions.length ||
      !props.featureEntitiesPlotted.length ||
      !plottedSideFeatures.length ||
      !filteredEntityFeatures.length
    ) {
      return (
        <Box
          sx={{
            px: 1.2,
            py: 1,
            borderRadius: 1.5,
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(45, 214, 196, 0.1)",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            표시할 항목이 없습니다.
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={1} direction={"column"} sx={{ gap: "8px" }}>
        {props.mobileView && entityMenuButtons()}
        {filteredEntityFeatures.map((feature: FeatureEntityState) => (
          <Tooltip
            key={feature.id}
            placement="right"
            arrow
            title={
              <Stack direction={"column"} spacing={0.1}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  이름: {feature.name}
                </Typography>
                {!feature.type.startsWith("reference") && (
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    유형: {getEntityTypeLabel(feature.type)}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  세력: {props.game.currentScenario.getSideName(feature.sideId)}
                </Typography>
              </Stack>
            }
          >
            <MenuItem
              disableRipple
              sx={{
                cursor: "help",
                borderRadius: 1.5,
                border: "1px solid rgba(45, 214, 196, 0.1)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
              key={feature.id}
              value={feature.name}
            >
              <ListItemIcon>
                <EntityIcon type={feature.type} color={feature.sideColor} />
              </ListItemIcon>
              <ListItemText primary={feature.name} sx={{ mr: 1 }} />
              <Tooltip title={`${feature.name} 삭제`}>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`${feature.name} 삭제`}
                  onClick={(event) => handleDeleteFeatureEntity(event, feature)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </MenuItem>
          </Tooltip>
        ))}
      </Stack>
    );
  };


  return {
    ScenarioDb, armyGptBriefingCards, baseSelectionAirbaseOptions,
    buildQuickAddSections, commandPanelSummary, currentSideId,
    currentSideMissionCount, currentSideName, currentSideOperationalFeatureCount,
    currentlySelectedSideIds, entitiesSection, entityFilterTypeOptions,
    entityMenuButtons, experienceMenu, experienceSections,
    filteredEntityFeatures, focusFireDockStage, focusFireInsight,
    focusFireRiskTone, focusFireSection, focusFireSectionOpen,
    focusFireSummary, handleEraserModeToggle, handleGodModeToggle,
    isEmptyScenario, keyboardEventHandler, missionSection,
    missionSectionOpen, plottedSideFeatures, presetScenarioSelectionMenu,
    quickAddMenu, quickAddSections, recommendedArtilleryBaseOptions,
    recordingSection, scenarioAssetCount, scenarioMissionCount,
    scenarioSideIds, scenarioStatusLabel, scenarioWeaponsInFlight,
    sectionHeaderBadges, selectedEntitySideIds, selectedEntityTypes,
    sideSelectCurrentSideId,
  };
}