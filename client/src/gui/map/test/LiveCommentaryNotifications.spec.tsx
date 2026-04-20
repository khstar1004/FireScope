import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import LiveCommentaryNotifications from "@/gui/map/toolbar/LiveCommentaryNotifications";
import type { LiveCommentaryNotification } from "@/gui/map/toolbar/liveCommentary";

const notification: LiveCommentaryNotification = {
  id: "log-1",
  sideName: "청군",
  sideColor: "#2dd6c4",
  occurredAtLabel: "11:02:08",
  headline: "AIM-9X Sidewinder 발사",
  commentary: "북한의 타격기 선회를 놓칩니다. 무료 교추 손실이 진행 중입니다.",
  tone: "warning",
};

describe("LiveCommentaryNotifications", () => {
  test("applies the provided right offset and renders the notification", () => {
    render(
      <LiveCommentaryNotifications
        notifications={[notification]}
        onDismiss={vi.fn()}
        rightOffset={372}
      />
    );

    expect(screen.getByTestId("live-commentary-notifications")).toHaveStyle({
      right: "372px",
    });
    expect(screen.getByText("AIM-9X Sidewinder 발사")).toBeInTheDocument();
    expect(
      screen.getByText("북한의 타격기 선회를 놓칩니다. 무료 교추 손실이 진행 중입니다.")
    ).toBeInTheDocument();
  });

  test("dismisses the selected notification", () => {
    const onDismiss = vi.fn();

    render(
      <LiveCommentaryNotifications
        notifications={[notification]}
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByLabelText("close-live-commentary"));

    expect(onDismiss).toHaveBeenCalledWith("log-1");
  });
});
