import type { RefObject } from "react";
import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@/gui/shared/ui/TextField";
import type { ChatMessage } from "@/gui/agent/chatbot.types";

export const DEFAULT_ARMY_GPT_QUICK_PROMPTS = [
  "현재 전력 요약",
  "가장 위험한 위협 분석",
  "블루팀 임무 추천",
  "화력 우선순위 정리",
];

export type ArmyGptBriefingTone =
  | "neutral"
  | "accent"
  | "warning"
  | "danger";

export interface ArmyGptBriefingCard {
  label: string;
  value: string;
  description: string;
  tone?: ArmyGptBriefingTone;
}

interface ArmyGptPanelProps {
  currentSideName: string;
  scenarioAssetCount: number;
  scenarioMissionCount: number;
  scenarioWeaponsInFlight: number;
  briefingCards?: ArmyGptBriefingCard[];
  messages: ChatMessage[];
  inputValue: string;
  isInputFocused: boolean;
  isLoading: boolean;
  chatMessagesContainerRef: RefObject<HTMLDivElement | null>;
  onInputChange: (value: string) => void;
  onFocusChange: (focused: boolean) => void;
  onSendMessage: (messageOverride?: string) => Promise<void> | void;
  quickPrompts?: string[];
}

export default function ArmyGptPanel(
  props: Readonly<ArmyGptPanelProps>
) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        minHeight: {
          xs: 420,
          md: 520,
        },
        px: 1.15,
        pt: 1.05,
        pb: 1.15,
        borderTop: "1px solid rgba(45, 214, 196, 0.2)",
        background:
          "radial-gradient(circle at top right, rgba(53, 217, 198, 0.14) 0%, transparent 34%), linear-gradient(180deg, rgba(8, 20, 26, 0.98) 0%, rgba(4, 11, 15, 1) 100%)",
        boxShadow: "0 -20px 36px rgba(0, 0, 0, 0.26)",
      }}
    >
      <Box
        ref={props.chatMessagesContainerRef}
        data-testid="army-gpt-messages"
        sx={{
          flexGrow: 1,
          minHeight: 320,
          overflowY: "auto",
          p: 1.05,
          borderRadius: 2.6,
          background:
            "linear-gradient(180deg, rgba(4, 14, 18, 0.9) 0%, rgba(2, 9, 13, 0.94) 100%)",
          border: "1px solid rgba(45, 214, 196, 0.1)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.025)",
        }}
      >
        {props.messages.length > 0 ? (
          <Stack spacing={1}>
            {props.messages.map((message) => {
              const isUser = message.sender === "user";
              return (
                <Box
                  key={message.id}
                  sx={{
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "88%",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 0.35,
                      px: 0.25,
                      color: isUser ? "rgba(134, 255, 242, 0.72)" : "text.secondary",
                      textAlign: isUser ? "right" : "left",
                    }}
                  >
                    {isUser ? "지휘관" : "ARMY-GPT"}
                  </Typography>
                  <Box
                    sx={{
                      px: 1.2,
                      py: 1,
                      borderRadius: isUser ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                      background: isUser
                        ? "linear-gradient(180deg, rgba(53, 217, 198, 0.92) 0%, rgba(31, 183, 167, 0.92) 100%)"
                        : "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.035) 100%)",
                      color: isUser ? "#041316" : "var(--fs-text)",
                      border: isUser
                        ? "1px solid rgba(134, 255, 242, 0.36)"
                        : "1px solid rgba(45, 214, 196, 0.12)",
                      boxShadow: isUser
                        ? "0 10px 20px rgba(31, 183, 167, 0.18)"
                        : "0 10px 24px rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}
                    >
                      {message.text}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "grid",
              placeItems: "center",
              px: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                lineHeight: 1.7,
              }}
            >
              Army-GPT와 바로 대화를 시작하세요.
            </Typography>
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="flex-end">
        <TextField
          id="chatbot-input"
          aria-label="Army-GPT 입력"
          fullWidth
          multiline
          minRows={2}
          maxRows={3}
          size="small"
          placeholder="예: 현재 전력 요약 / 가장 위험한 위협 분석 / 블루팀 임무 추천"
          value={props.inputValue}
          disabled={props.isLoading}
          onChange={(event) => props.onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void props.onSendMessage();
            }
          }}
          onFocus={() => props.onFocusChange(true)}
          onBlur={() => props.onFocusChange(false)}
          sx={{
            mb: 0,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.4,
              pr: 0.2,
              bgcolor: props.isInputFocused
                ? "rgba(8, 24, 30, 0.94)"
                : "rgba(255,255,255,0.045)",
              color: "var(--fs-text)",
              boxShadow: props.isInputFocused
                ? "0 0 0 1px rgba(45, 214, 196, 0.24), 0 12px 22px rgba(0, 0, 0, 0.18)"
                : "none",
              transition:
                "background-color 140ms ease, box-shadow 140ms ease, border-color 140ms ease",
            },
            "& .MuiInputBase-input": {
              color: "var(--fs-text)",
            },
            "& .MuiInputBase-input::placeholder": {
              color: "rgba(221, 255, 250, 0.42)",
              opacity: 1,
            },
          }}
        />
        <IconButton
          aria-label="Army-GPT 전송"
          color="primary"
          onClick={() => {
            void props.onSendMessage();
          }}
          disabled={props.isLoading || props.inputValue.trim().length === 0}
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.5,
            alignSelf: "stretch",
            background:
              "linear-gradient(180deg, rgba(53, 217, 198, 0.96) 0%, rgba(31, 183, 167, 0.96) 100%)",
            color: "#041316",
            border: "1px solid rgba(134, 255, 242, 0.32)",
            boxShadow: "0 16px 28px rgba(31, 183, 167, 0.22)",
            "&:hover": {
              background:
                "linear-gradient(180deg, rgba(134, 255, 242, 0.98) 0%, rgba(53, 217, 198, 0.98) 100%)",
            },
            "&.Mui-disabled": {
              background: "rgba(255,255,255,0.06)",
              color: "rgba(221, 255, 250, 0.28)",
              borderColor: "rgba(255,255,255,0.05)",
              boxShadow: "none",
            },
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
