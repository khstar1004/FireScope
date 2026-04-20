import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import ToolbarCollapsible from "@/gui/map/toolbar/ToolbarCollapsible";

describe("ToolbarCollapsible", () => {
  test("opens its content when the open signal changes", async () => {
    const view = render(
      <ToolbarCollapsible
        title="자산 배치"
        content={<div>배치 목록</div>}
        open={false}
      />
    );

    expect(screen.queryByText("배치 목록")).not.toBeInTheDocument();

    view.rerender(
      <ToolbarCollapsible
        title="자산 배치"
        content={<div>배치 목록</div>}
        open={false}
        openSignal={1}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("배치 목록")).toBeInTheDocument();
    });
  });

  test("renders subtitle and header badges when provided", () => {
    render(
      <ToolbarCollapsible
        title="화력 작전"
        subtitle="목표 지정과 포격 상태"
        headerBadges={[
          { label: "충격량 52", tone: "warning" },
          { label: "집중포격 준비", tone: "accent" },
        ]}
        content={<div>화력 목록</div>}
        open={false}
      />
    );

    expect(screen.getByText("목표 지정과 포격 상태")).toBeInTheDocument();
    expect(screen.getByText("충격량 52")).toBeInTheDocument();
    expect(screen.getByText("집중포격 준비")).toBeInTheDocument();
  });
});
