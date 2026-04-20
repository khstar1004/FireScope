import type Game from "@/game/Game";
import { useState } from "react";
import { requestAssistantCompletion } from "./chatbotApi";
import {
  buildAssistantSystemPrompt,
  buildScenarioContextMessage,
} from "./chatbotContext";
import type { ChatMessage, LlmMessage } from "./chatbot.types";

interface UseChatbotOptions {
  game: Game;
}

export const useChatbot = ({ game }: UseChatbotOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "안녕하세요. 현재 시나리오를 기준으로 전력 요약, 위험 분석, 임무 제안을 도와드리겠습니다.",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateBotResponse = async (
    userMessage: string,
    conversationMessages: ChatMessage[]
  ): Promise<string> => {
    const recentMessages = conversationMessages.slice(0, -1).slice(-8);
    const llmMessages: LlmMessage[] = [
      {
        role: "system",
        content: buildAssistantSystemPrompt(),
      },
      ...recentMessages.map<LlmMessage>((message) => ({
        role: message.sender === "user" ? "user" : "assistant",
        content: message.text,
      })),
      {
        role: "user",
        content: buildScenarioContextMessage(game, userMessage),
      },
    ];

    return requestAssistantCompletion(llmMessages);
  };

  const handleSendMessage = async (messageOverride?: string) => {
    const trimmedInput = (messageOverride ?? inputValue).trim();
    if (trimmedInput === "" || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: trimmedInput,
      sender: "user",
    };
    const loadingBotMessage: ChatMessage = {
      id: Date.now() + 1,
      text: "답변 정리 중...",
      sender: "bot",
      isLoading: true,
    };
    const conversationMessages = [...messages, userMessage];

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      loadingBotMessage,
    ]);
    setInputValue("");
    setIsLoading(true);

    try {
      const botResponseText = await generateBotResponse(
        trimmedInput,
        conversationMessages
      );
      const botResponse: ChatMessage = {
        id: Date.now() + 2,
        text: botResponseText,
        sender: "bot",
      };

      setMessages((prevMessages) => {
        const messagesWithoutLoading = prevMessages.filter(
          (message) => !message.isLoading
        );
        return [...messagesWithoutLoading, botResponse];
      });
    } catch (error) {
      console.error("Error in handleSendMessage:", error);

      const errorMessage: ChatMessage = {
        id: Date.now() + 2,
        text: "메시지를 처리하는 중 문제가 생겼습니다. 다시 시도해 주세요.",
        sender: "bot",
      };

      setMessages((prevMessages) => {
        const messagesWithoutLoading = prevMessages.filter(
          (message) => !message.isLoading
        );
        return [...messagesWithoutLoading, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    inputValue,
    setInputValue,
    handleSendMessage,
    isLoading,
  };
};
