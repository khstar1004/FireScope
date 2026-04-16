import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import CombatStatusBar from "@/gui/map/feature/shared/CombatStatusBar";

describe("CombatStatusBar", () => {
  test("renders combat HP, defense, and attack stats", () => {
    render(
      <CombatStatusBar
        currentHp={20}
        maxHp={100}
        defense={15}
        attackPower={75}
      />
    );

    expect(screen.getByText("위험")).toBeInTheDocument();
    expect(screen.getByText(/20 \/ 100/)).toBeInTheDocument();
    expect(screen.getByText("DEF 15")).toBeInTheDocument();
    expect(screen.getByText("ATK 75")).toBeInTheDocument();
    expect(screen.getByTestId("combat-status-bar-fill")).toBeInTheDocument();
  });
});
