import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ArmyGptPanel from "@/gui/map/toolbar/ArmyGptPanel";
import type { ChatMessage } from "@/gui/agent/chatbot.types";

const messages: ChatMessage[] = [
  {
    id: 1,
    text: "현재 전황을 요약해 드리겠습니다.",
    sender: "bot",
  },
];

describe("ArmyGptPanel", () => {
  test("renders the chat panel without the removed briefing content", () => {
    render(
      <ArmyGptPanel
        currentSideName="Blue"
        scenarioAssetCount={12}
        scenarioMissionCount={3}
        scenarioWeaponsInFlight={2}
        briefingCards={[
          {
            label: "전력",
            value: "자산 12 · 임무 3",
            description: "블루팀 기준 현재 전장 자산과 임무를 추적합니다.",
            tone: "accent",
          },
          {
            label: "위협",
            value: "경계",
            description: "임무와 비행탄이 겹쳐 템포가 높습니다.",
            tone: "warning",
          },
        ]}
        messages={messages}
        inputValue=""
        isInputFocused={false}
        isLoading={false}
        chatMessagesContainerRef={createRef<HTMLDivElement>()}
        onInputChange={vi.fn()}
        onFocusChange={vi.fn()}
        onSendMessage={vi.fn()}
      />
    );

    expect(screen.getByText("현재 전황을 요약해 드리겠습니다.")).toBeInTheDocument();
    expect(screen.queryByText("TACTICAL AI COPILOT")).not.toBeInTheDocument();
    expect(screen.queryByText("바로 물어보기")).not.toBeInTheDocument();
    expect(screen.queryByText("즉시 브리핑")).not.toBeInTheDocument();
  });

  test("sends keyboard submissions through callbacks", () => {
    const onSendMessage = vi.fn();

    render(
      <ArmyGptPanel
        currentSideName="Blue"
        scenarioAssetCount={12}
        scenarioMissionCount={3}
        scenarioWeaponsInFlight={2}
        messages={messages}
        inputValue="직접 입력"
        isInputFocused={true}
        isLoading={false}
        chatMessagesContainerRef={createRef<HTMLDivElement>()}
        onInputChange={vi.fn()}
        onFocusChange={vi.fn()}
        onSendMessage={onSendMessage}
      />
    );

    fireEvent.keyDown(screen.getByLabelText("Army-GPT 입력"), {
      key: "Enter",
      code: "Enter",
    });
    expect(onSendMessage).toHaveBeenCalledWith();
  });
});
