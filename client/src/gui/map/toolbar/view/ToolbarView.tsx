// @ts-nocheck

export default function ToolbarView(ctx) {
  const {
    APP_DISPLAY_NAME, AddBoxIcon, AirlineStopsOutlinedIcon,
    AppBar, ArmyGptPanel, AssetPlacementPreviewDialog,
    Box, Button, COLOR_PALETTE,
    CardActions, Chip, Container,
    Dialog, Divider, DocumentScannerOutlinedIcon,
    Drawer, DrawerHeader, EditIcon,
    FileDownloadOutlinedIcon, IconButton, InsertDriveFileIcon,
    KeyboardArrowDownIcon, List, ListSubheader,
    LoginLogout, MapToolbar, Menu,
    MenuIcon, MenuOpenOutlinedIcon, Pause,
    PlayArrow, RadioButtonCheckedIcon, RestartAltIcon,
    Save, SideSelect, Stack,
    TextField, ToolbarCollapsible, Tooltip,
    Typography, Undo, UploadFileOutlinedIcon,
    ViewInArOutlinedIcon, VisibilityOutlinedIcon, armyGptBriefingCards,
    assetPlacementPreview, chatMessagesContainerRef, cloudScenarios,
    commandPanelSummary, compactToolbar, currentSideName,
    entitiesSection, entityFilterSelectedOptions, entityMenuButtons,
    experienceMenu, exportScenario, focusFireDockStage,
    focusFireSection, focusFireSectionOpen, handleAssetPlacementPreviewClose,
    handleAssetPlacementPreviewConfirm, handleCloseScenarioEditNameMenu, handleExperienceMenuToggle,
    handleLoadScenarioIconClick, handleOpenScenarioEditNameMenu, handlePlayClick,
    handleQuickAddMenuToggle, handleScenarioNameChange, handleScenarioNameSubmit,
    handleSendMessage, handleSideChange, handleStepClick,
    handleUndo, inputValue, isAuthenticated,
    isChatInputFocused, isEmptyScenario, isLoading,
    messages, missionSection,
    missionSectionOpen, newScenario, presetScenarioSelectionMenu,
    props, quickAddMenu, quickAddMenuOpen,
    recordingSection, reloadScenario, saveScenarioToCloud,
    scenarioAssetCount, scenarioEditNameAnchorEl, scenarioLaunchDialogOpen,
    scenarioMissionCount, scenarioName, scenarioNameError,
    scenarioPaused, scenarioStatusLabel, scenarioWeaponsInFlight,
    sectionHeaderBadges, setEntityFilterSelectedOptions, setInputValue,
    setIsChatInputFocused, setScenarioLaunchDialogOpen, showEntityShortcutStrip,
    showExperienceShortcut, showSideSelect, sideSelectCurrentSideId,
    startScenarioIn2dMode, startScenarioIn3dMode, toolbarDrawerStyle,
    toolbarStyle, ultraCompactToolbar, visuallyHidden,
  } = ctx;

  return (
    <>
      <Dialog
        open={scenarioLaunchDialogOpen}
        onClose={() => setScenarioLaunchDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            px: { xs: 2, sm: 3 },
            py: { xs: 2.5, sm: 3 },
            borderRadius: 4,
          },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: "100%" }}
        >
          <Button
            variant="contained"
            onClick={startScenarioIn2dMode}
            sx={{
              flex: 1,
              minHeight: 92,
              fontSize: "1.3rem",
              fontWeight: 800,
              borderRadius: 3,
            }}
          >
            2D모드
          </Button>
          <Button
            variant="contained"
            onClick={startScenarioIn3dMode}
            sx={{
              flex: 1,
              minHeight: 92,
              fontSize: "1.3rem",
              fontWeight: 800,
              borderRadius: 3,
            }}
          >
            영역 3D
          </Button>
        </Stack>
      </Dialog>

      <AppBar
        position="fixed"
        elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <MapToolbar
          variant="dense"
          sx={{
            ...toolbarStyle,
            overflow: "hidden",
            gap: 1,
            px: 1.25,
            py: 0.65,
          }}
          disableGutters
        >
          {props.drawerOpen ? (
            <Tooltip title="실행 도크 닫기">
              <IconButton
                color="inherit"
                aria-label="실행 도크 닫기"
                onClick={props.closeDrawer}
                edge="start"
                sx={{ color: COLOR_PALETTE.BLACK }}
              >
                <MenuOpenOutlinedIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="실행 도크 열기">
              <IconButton
                color="inherit"
                aria-label="실행 도크 열기"
                onClick={props.openDrawer}
                edge="start"
                sx={{ color: COLOR_PALETTE.BLACK }}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}

          <Stack
            direction={"row"}
            sx={{
              alignItems: "center",
              gap: compactToolbar ? 0.75 : 1.25,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: compactToolbar ? 0.75 : 1.25,
                pr: 0.5,
                minWidth: 0,
                flexShrink: 1,
              }}
            >
              <Box
                component="img"
                src="/main-logo.svg"
                alt={`${APP_DISPLAY_NAME} 로고`}
                sx={{
                  width: compactToolbar ? 34 : 38,
                  height: compactToolbar ? 34 : 38,
                  borderRadius: 0.75,
                  objectFit: "cover",
                  boxShadow: "0 0 18px rgba(45, 214, 196, 0.18)",
                  flexShrink: 0,
                }}
              />
              <Box
                sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}
              >
                <Typography
                  variant="h6"
                  noWrap
                  sx={{
                    display: "flex",
                    fontWeight: 700,
                    color: COLOR_PALETTE.BLACK,
                    lineHeight: 1.05,
                    fontSize: compactToolbar ? "1rem" : undefined,
                  }}
                >
                  {APP_DISPLAY_NAME}
                </Typography>
              </Box>
            </Box>
            {showEntityShortcutStrip && (
              <>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    borderColor: COLOR_PALETTE.DARK_GRAY,
                    mx: 0.4,
                  }}
                />
                {entityMenuButtons()}
              </>
            )}
            {(showEntityShortcutStrip || !ultraCompactToolbar) && (
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{
                  borderColor: COLOR_PALETTE.DARK_GRAY,
                  mr: compactToolbar ? 0.8 : 1.6,
                }}
              />
            )}
            <Box
              sx={{
                px: 0.45,
                py: 0.35,
                borderRadius: 999,
                backgroundColor: quickAddMenuOpen
                  ? "rgba(255, 255, 255, 0.14)"
                  : "rgba(255, 255, 255, 0.1)",
                border: quickAddMenuOpen
                  ? "1px solid rgba(134, 255, 242, 0.26)"
                  : "1px solid rgba(134, 255, 242, 0.14)",
              }}
            >
              <Button
                variant="contained"
                onClick={handleQuickAddMenuToggle}
                startIcon={<AddBoxIcon />}
                endIcon={
                  !ultraCompactToolbar ? <KeyboardArrowDownIcon /> : undefined
                }
                sx={{
                  borderRadius: "999px",
                  border: quickAddMenuOpen
                    ? "1px solid rgba(134, 255, 242, 0.72)"
                    : "1px solid rgba(134, 255, 242, 0.3)",
                  backgroundColor: quickAddMenuOpen
                    ? "rgba(134, 255, 242, 0.96)"
                    : "rgba(53, 217, 198, 0.94)",
                  color: "#031114",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                  px: ultraCompactToolbar ? 1.15 : 1.45,
                  minWidth: ultraCompactToolbar ? "auto" : undefined,
                  boxShadow: quickAddMenuOpen
                    ? "0 0 0 1px rgba(134, 255, 242, 0.18), 0 0 24px rgba(53, 217, 198, 0.38)"
                    : "0 0 0 1px rgba(53, 217, 198, 0.14), 0 12px 24px rgba(53, 217, 198, 0.2)",
                  "&:hover": {
                    backgroundColor: "rgba(134, 255, 242, 0.98)",
                    boxShadow:
                      "0 0 0 1px rgba(134, 255, 242, 0.18), 0 0 26px rgba(53, 217, 198, 0.44)",
                  },
                }}
              >
                {ultraCompactToolbar ? "자산" : "자산 종류"}
              </Button>
            </Box>
            {quickAddMenu()}
            {showSideSelect && (
              <SideSelect
                sides={props.game.currentScenario.sides}
                currentSideId={sideSelectCurrentSideId}
                onSideSelect={handleSideChange}
                openSideEditor={props.handleOpenSideEditor}
              />
            )}
            {showExperienceShortcut && (
              <Button
                variant="outlined"
                onClick={props.openScenario3dView}
                startIcon={<VisibilityOutlinedIcon />}
                sx={{
                  borderColor: "rgba(45, 214, 196, 0.28)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {compactToolbar ? "3D" : "영역 3D"}
              </Button>
            )}
            {showExperienceShortcut && (
              <Button
                variant="contained"
                onClick={handleExperienceMenuToggle}
                startIcon={<ViewInArOutlinedIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
              >
                {compactToolbar ? "체험" : "3D 체험"}
              </Button>
            )}
            {experienceMenu()}
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <LoginLogout />
        </MapToolbar>
      </AppBar>
      {/** Side Drawer */}
      <Drawer
        sx={toolbarDrawerStyle}
        variant="persistent"
        anchor="right"
        open={props.drawerOpen}
      >
        {/** Container/Wrapper */}
        <Container
          disableGutters
          sx={{
            backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            flexGrow: 1,
            borderLeft: "1px solid",
            borderLeftColor: COLOR_PALETTE.DARK_GRAY,
            overflow: "hidden",
          }}
        >
          <DrawerHeader />
          <Box
            sx={{ flexGrow: 1, minHeight: 0, overflowY: "auto", padding: 1 }}
          >
            <Stack>
              <Box
                sx={{
                  mx: 1,
                  mb: 0.9,
                  p: 1.15,
                  borderRadius: 2.6,
                  background:
                    "radial-gradient(circle at top left, rgba(53, 217, 198, 0.12) 0%, transparent 42%), linear-gradient(180deg, rgba(9, 24, 30, 0.98) 0%, rgba(6, 16, 21, 0.96) 100%)",
                  border: "1px solid rgba(45, 214, 196, 0.12)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                  justifyContent="space-between"
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {props.game.currentScenario.name}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.45,
                        fontSize: 11.8,
                        lineHeight: 1.45,
                        color: "text.secondary",
                      }}
                    >
                      {isEmptyScenario
                        ? "자산 배치 필요"
                        : `자산 ${scenarioAssetCount} · 임무 ${scenarioMissionCount} · 비행탄 ${scenarioWeaponsInFlight}`}
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.95,
                        px: 0.95,
                        py: 0.8,
                        borderRadius: 2.2,
                        backgroundColor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(45, 214, 196, 0.1)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 11.2,
                          fontWeight: 700,
                          lineHeight: 1.45,
                          color:
                            commandPanelSummary.riskTone === "danger"
                              ? "#ffb0b0"
                              : commandPanelSummary.riskTone === "warning"
                                ? "var(--fs-sand)"
                                : "var(--fs-accent-soft)",
                        }}
                      >
                        {commandPanelSummary.summary}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={0.8} sx={{ flexShrink: 0 }}>
                    <Chip
                      size="small"
                      variant={
                        props.game.scenarioPaused ? "outlined" : "filled"
                      }
                      label={scenarioStatusLabel}
                      sx={{ flexShrink: 0 }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={commandPanelSummary.riskLabel}
                      sx={{
                        flexShrink: 0,
                        color:
                          commandPanelSummary.riskTone === "danger"
                            ? "#ffb0b0"
                            : commandPanelSummary.riskTone === "warning"
                              ? "var(--fs-sand)"
                              : "var(--fs-accent-soft)",
                        borderColor:
                          commandPanelSummary.riskTone === "danger"
                            ? "rgba(255, 122, 122, 0.26)"
                            : commandPanelSummary.riskTone === "warning"
                              ? "rgba(240, 187, 109, 0.28)"
                              : "rgba(45, 214, 196, 0.24)",
                        backgroundColor:
                          commandPanelSummary.riskTone === "danger"
                            ? "rgba(255, 122, 122, 0.08)"
                            : commandPanelSummary.riskTone === "warning"
                              ? "rgba(240, 187, 109, 0.08)"
                              : "rgba(45, 214, 196, 0.08)",
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>
              <CardActions
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  px: 1,
                  py: 0.2,
                }}
              >
                <Stack
                  direction="row"
                  divider={<Divider orientation="vertical" flexItem />}
                  spacing={1}
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    px: 0.75,
                    py: 0.45,
                    borderRadius: 2.2,
                    backgroundColor: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(45, 214, 196, 0.08)",
                  }}
                >
                  <Tooltip title="새로 만들기">
                    <IconButton onClick={newScenario}>
                      <InsertDriveFileIcon
                        fontSize="medium"
                        sx={{ color: "var(--fs-text)" }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="불러오기">
                    <IconButton onClick={handleLoadScenarioIconClick}>
                      <UploadFileOutlinedIcon
                        fontSize="medium"
                        sx={{ color: "var(--fs-text)" }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={
                      isAuthenticated
                        ? cloudScenarios.length > 4
                          ? "클라우드 저장 한도에 도달했습니다. 기존 시나리오를 삭제한 뒤 다시 저장하세요."
                          : "클라우드 저장"
                        : "로그인 후 저장할 수 있습니다."
                    }
                  >
                    <IconButton onClick={saveScenarioToCloud}>
                      <Save
                        fontSize="medium"
                        sx={{
                          color: isAuthenticated
                            ? "var(--fs-text)"
                            : "rgba(221, 255, 250, 0.3)",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={
                      isAuthenticated ||
                      import.meta.env.VITE_ENV !== "production"
                        ? "파일 저장"
                        : "로그인 후 저장할 수 있습니다."
                    }
                  >
                    <IconButton onClick={exportScenario}>
                      <FileDownloadOutlinedIcon
                        fontSize="medium"
                        sx={{
                          color:
                            isAuthenticated ||
                            import.meta.env.VITE_ENV !== "production"
                              ? "var(--fs-text)"
                              : "rgba(221, 255, 250, 0.3)",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                  {/* Scenario Name Edit Menu/Button  */}
                  <Tooltip title="이름 바꾸기">
                    <IconButton onClick={handleOpenScenarioEditNameMenu}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardActions>
              <Menu
                anchorEl={scenarioEditNameAnchorEl}
                open={Boolean(scenarioEditNameAnchorEl)}
                onClose={handleCloseScenarioEditNameMenu}
                slotProps={{
                  root: { sx: { ".MuiList-root": { padding: 0 } } },
                }}
              >
                <Typography variant="h6" sx={{ textAlign: "center", p: 1 }}>
                  이름 바꾸기
                </Typography>

                <form
                  onSubmit={handleScenarioNameSubmit}
                  style={{
                    width: "100%",
                  }}
                >
                  <Stack direction={"column"} spacing={1} sx={{ p: 1 }}>
                    <TextField
                      error={scenarioNameError}
                      helperText={
                        scenarioNameError
                          ? '한글/영문/숫자 사용 가능, ":,-" 허용, 최대 25자'
                          : ""
                      }
                      autoComplete="off"
                      id="scenario-name-text-field"
                      label="시나리오 이름"
                      sx={{ width: "100%" }}
                      onChange={handleScenarioNameChange}
                      defaultValue={scenarioName}
                    />
                    <Stack direction={"row"} spacing={1}>
                      <Button
                        disabled={
                          !scenarioName.length ||
                          props.game.currentScenario.name === scenarioName
                        }
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="small"
                      >
                        저장
                      </Button>
                      <Button
                        onClick={handleCloseScenarioEditNameMenu}
                        type="button"
                        fullWidth
                        variant="contained"
                        size="small"
                        color="error"
                      >
                        취소
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </Menu>
              {presetScenarioSelectionMenu()}
              <CardActions
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  px: 1,
                  py: 0.35,
                }}
              >
                <Stack
                  direction="row"
                  divider={<Divider orientation="vertical" flexItem />}
                  spacing={1}
                  sx={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    px: 0.75,
                    py: 0.3,
                    borderRadius: 2.2,
                    backgroundColor: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(45, 214, 196, 0.08)",
                  }}
                >
                  <Tooltip title="1단계 진행">
                    <Chip
                      variant="outlined"
                      label="1단계"
                      onClick={handleStepClick}
                    />
                  </Tooltip>
                  <Tooltip title="다시 시작">
                    <IconButton onClick={reloadScenario}>
                      <RestartAltIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={"실행 취소"}>
                    <IconButton onClick={handleUndo}>{<Undo />}</IconButton>
                  </Tooltip>
                  <Tooltip title={!scenarioPaused ? "일시정지" : "실행"}>
                    <IconButton onClick={handlePlayClick}>
                      {!scenarioPaused ? <Pause /> : <PlayArrow />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="속도 바꾸기">
                    <Chip
                      onClick={props.toggleScenarioTimeCompressionOnClick}
                      variant="outlined"
                      label={`속도 ${props.scenarioTimeCompression}x`}
                      sx={{
                        minWidth: "82px",
                      }}
                    />
                  </Tooltip>
                </Stack>
              </CardActions>
            </Stack>
            {/** Toolbar Feature Controls Dropdown/List Section */}
            <List
              sx={{
                py: 0,
                width: "100%",
                backgroundColor: COLOR_PALETTE.LIGHT_GRAY,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
              component="nav"
              aria-labelledby="feature-controls-dropdown-list"
              subheader={
                <ListSubheader
                  color="inherit"
                  component="div"
                  id="feature-controls-dropdown-list"
                  sx={{
                    ...visuallyHidden, // screen reader only
                    backgroundColor: "transparent",
                  }}
                >
                  기능
                </ListSubheader>
              }
            >
              <ToolbarCollapsible
                title="기록 / 재생"
                headerBadges={sectionHeaderBadges.recording}
                prependIcon={RadioButtonCheckedIcon}
                content={recordingSection()}
                open={false}
              />
              <ToolbarCollapsible
                title="자산 배치"
                headerBadges={sectionHeaderBadges.assets}
                prependIcon={DocumentScannerOutlinedIcon}
                content={entitiesSection()}
                enableFilter={true}
                openSignal={props.assetPlacementOpenSignal}
                filterProps={{
                  options: [
                    { label: "항공기", value: "aircraft" },
                    { label: "기지", value: "airbase" },
                    { label: "지상군", value: "army" },
                    { label: "지상 무기체계", value: "facility" },
                    { label: "함정", value: "ship" },
                    { label: "참조점", value: "referencePoint" },
                  ],
                  onApplyFilterOptions: (selectedOptions: string[]) => {
                    const sideIds = props.game.currentScenario.sides.map(
                      (side) => side.id
                    );
                    const selectedSideIds =
                      entityFilterSelectedOptions.filter((item) =>
                        sideIds.includes(item)
                      ) || [];
                    const updatedOptions = [
                      ...selectedSideIds,
                      ...selectedOptions,
                    ];
                    setEntityFilterSelectedOptions(updatedOptions);
                  },
                }}
                open={isEmptyScenario}
              />
              <ToolbarCollapsible
                title="화력 작전"
                subtitle={focusFireDockStage.title}
                headerBadges={sectionHeaderBadges.focusFire}
                prependIcon={RadioButtonCheckedIcon}
                content={focusFireSection()}
                open={focusFireSectionOpen}
              />
              <ToolbarCollapsible
                title="임무"
                headerBadges={sectionHeaderBadges.mission}
                prependIcon={AirlineStopsOutlinedIcon}
                content={missionSection()}
                appendIcon={AddBoxIcon}
                appendIconProps={{
                  tooltipProps: {
                    title: "임무 추가",
                  },
                  onClick: () => {
                    props.toggleMissionCreator();
                  },
                }}
                open={missionSectionOpen}
              />
            </List>
          </Box>
          <ArmyGptPanel
            currentSideName={currentSideName}
            scenarioAssetCount={scenarioAssetCount}
            scenarioMissionCount={scenarioMissionCount}
            scenarioWeaponsInFlight={scenarioWeaponsInFlight}
            briefingCards={armyGptBriefingCards}
            messages={messages}
            inputValue={inputValue}
            isInputFocused={isChatInputFocused}
            isLoading={isLoading}
            chatMessagesContainerRef={chatMessagesContainerRef}
            onInputChange={setInputValue}
            onFocusChange={setIsChatInputFocused}
            onSendMessage={handleSendMessage}
          />
        </Container>
      </Drawer>
      <AssetPlacementPreviewDialog
        open={Boolean(assetPlacementPreview)}
        preview={assetPlacementPreview}
        onClose={handleAssetPlacementPreviewClose}
        onConfirm={handleAssetPlacementPreviewConfirm}
      />
    </>
  );
}
