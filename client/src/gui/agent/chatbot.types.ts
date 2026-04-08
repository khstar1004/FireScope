// This file is dedicated to holding type definitions.
export interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  isLoading?: boolean;
}

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
