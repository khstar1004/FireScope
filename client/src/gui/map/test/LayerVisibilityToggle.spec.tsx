import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import LayerVisibilityPanelToggle from "@/gui/map/toolbar/LayerVisibilityToggle";

describe("LayerVisibilityPanelToggle", () => {
  test("toggles weapon trajectories from the layer panel", async () => {
    const toggleWeaponTrajectoryVisibility = vi.fn();

    render(
      <LayerVisibilityPanelToggle
        baseMapModes={[
          { id: "osm", label: "OSM" },
          { id: "hybrid", label: "Hybrid" },
        ]}
        activeBaseMapModeId="osm"
        featureLabelVisibility={true}
        toggleFeatureLabelVisibility={vi.fn()}
        threatRangeVisibility={true}
        toggleThreatRangeVisibility={vi.fn()}
        routeVisibility={true}
        toggleRouteVisibility={vi.fn()}
        weaponTrajectoryVisibility={false}
        toggleWeaponTrajectoryVisibility={toggleWeaponTrajectoryVisibility}
        toggleBaseMapLayer={vi.fn()}
        toggleReferencePointVisibility={vi.fn()}
        referencePointVisibility={true}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "레이어 제어" }));
    fireEvent.click(
      await screen.findByRole("button", { name: /무기 궤적/ })
    );

    expect(toggleWeaponTrajectoryVisibility).toHaveBeenCalledWith(true);
  });
});
