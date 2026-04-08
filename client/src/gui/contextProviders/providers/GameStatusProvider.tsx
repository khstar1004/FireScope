import React, { useState } from "react";
import {
  GameStatusContext,
  SetGameStatusContext,
} from "@/gui/contextProviders/contexts/GameStatusContext";

export const GameStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentGameStatus, setCurrentGameStatus] =
    useState<string>("시나리오 일시정지"); // TODO: Create enum for game statuses

  return (
    <GameStatusContext.Provider value={currentGameStatus}>
      <SetGameStatusContext.Provider value={setCurrentGameStatus}>
        {children}
      </SetGameStatusContext.Provider>
    </GameStatusContext.Provider>
  );
};
