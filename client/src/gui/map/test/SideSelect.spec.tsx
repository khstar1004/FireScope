import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import SideSelect from "@/gui/map/toolbar/SideSelect";
import Side from "@/game/Side";

describe("SideSelect", () => {
  test("does not keep a removed side id selected after scenario options change", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const initialSides = [
      new Side({
        id: "a3a34644-5abe-459b-bf05-5e9cf643b47f",
        name: "초기 세력",
        color: "blue",
      }),
    ];
    const nextSides = [
      new Side({
        id: "focus-force",
        name: "집중 화력",
        color: "red",
      }),
      new Side({
        id: "observation-cell",
        name: "관측반",
        color: "green",
      }),
    ];

    const { rerender } = render(
      <SideSelect
        sides={initialSides}
        currentSideId="a3a34644-5abe-459b-bf05-5e9cf643b47f"
        onSideSelect={vi.fn()}
        openSideEditor={vi.fn()}
      />
    );

    rerender(
      <SideSelect
        sides={nextSides}
        currentSideId="a3a34644-5abe-459b-bf05-5e9cf643b47f"
        onSideSelect={vi.fn()}
        openSideEditor={vi.fn()}
      />
    );

    expect(screen.getByText("세력 선택")).toBeInTheDocument();
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("out-of-range value")
    );

    consoleErrorSpy.mockRestore();
  });
});
